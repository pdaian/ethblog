// ethblog javascript library -- designed to be HUMAN READABLE and use 0 JAVASCRIPT OR WEB3 LIBRARIES

// public JSON-RPC fallback used when no injected wallet is available
RPC_URL = "https://ethereum-rpc.publicnode.com";
CHAIN_ID = "0x1"; // switch this if you want to provide a frontend to a chain that isn't eth mainnet

var body_html = "";
var has_web3 = false;
var has_errored = false; // set to true if any web3 calls fail for any reason

 // philosophically channeling https://randyperkins2k.medium.com/writing-a-simple-markdown-parser-using-javascript-1f2e9449a558
const parsed_markdown = (text) => {
	const toHTML = text
		.replace(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag
		.replace(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag
		.replace(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag
		.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>') // bold text
		.replace(/\*(.*)\*/gim, '<i>$1</i>') // italic text
	return toHTML.trim(); // using trim method to remove whitespace
}


// boilerplate for the CSS/html header, all for prettifying
CSS_HEADER = `
<head>
<title>ethblog ~~ loading</title>
<style>
html *
{
   color: #000;
   font-family: Garamond;
}
h1 {
    text-align: center;
}
h2 {
    margin-bottom: 0px;
}
hr {
    border-top: 1px dotted gray;
    width: 70%;
    margin: auto;
}
.subtext {
    font-size: 0.5em;
    color: gray;
    text-align: center;
    display: block;
}
.post {
    width: 75%;
    text-align: justify;
    margin: auto;
}
.bigger {
    font-size: 1.5em;
}
</style>

</head>
<body>
`
CENTRALIZED_WARNING_BANNER = `<div id="centralizedwarning" style="width: 90%; text-align: center; background:  #FF7955 ; margin: auto; padding: 10px;"> <b>You are currently viewing ethblog through a public Ethereum RPC endpoint.</b><br><br>To read directly through your own wallet provider, <a href="https://support.metamask.io/start/getting-started-with-metamask/">install a web3-enabled wallet</a> and refresh the page.</div>`

// some boilerpate for title subscript and footer
ethblog_SUB = `<i class="subtext"> musings powered by <a href="https://github.com/pdaian/ethblog/">ethblog</a> and stored respecting your freedoms, forever* with the iron-clad guarantees of L1 </i>`
ethblog_FOOTER = `<i class="subtext"> to read about why ethblog is the most freedom-preserving way to publish, <a href="https://github.com/pdaian/ethblog/blob/main/README.md">read our docs</a>.<br><br>*forever not actually guaranteed and certainly never promised`


// work function to call eth; only other function that touches wallet
async function eth_call(contract_address, hex_data) {
    const callData = {
        to: contract_address,
        data: hex_data,
        chainId: CHAIN_ID
    };

    try {
        const result = await window.ethereum.request({
            method: 'eth_call',
            params: [callData, 'latest'],
        });
        console.log('Result:', result);
        return result;
    } catch (error) {
        document.getRootNode().getRootNode().body.innerHTML = "<b>There was an error calling the contract; make sure your node is up and the contract is a valid EthBlog contract, and that the post you are trying to access exists.</b><br><br>To see examples of how to load an ethblog, <a href='//github.com/pdaian/ethblog/blob/main/README.md'>read our docs</a>.<br><br>Error message: " + error; 
        console.log(error);
        has_errored = true;
    }
}

// RPC fallback for the above
async function rpc_call(contract_address, hex_data) {
    const payload = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
            {
                to: contract_address,
                data: hex_data
            },
            "latest"
        ]
    };

    try {
        const response = await fetch(RPC_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || result.error || typeof result.result !== "string") {
            throw new Error(result.error ? result.error.message : ("HTTP request returned status " + response.status));
        }
        return result.result;
    } catch (error) {
        document.getRootNode().getRootNode().body.innerHTML = "<b>There was an error calling the contract; make sure your RPC endpoint is up, the contract is a valid EthBlog contract, and that the post you are trying to access exists.</b><br><br>To see examples of how to load an ethblog, <a href='//github.com/pdaian/ethblog/blob/main/README.md'>read our docs</a>.<br><br>Error message: " + error;
        has_errored = true;
    }
}

// check address format, ignoring checksum (later queries will fail anyway)
function is_address_valid(address) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return false;
    }
    return true;
}

// don't allow users to input their own HTML
function escape_html(unsafe)
{
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}


// 3 minimal abi functions, easy 2 audit
function encode_int(value) {
    return value.toString(16).padStart(64, '0'); // Convert to hex and pad to 64 characters
}

function decode_int(value) {
    return parseInt(BigInt(value).toString()); // Convert hex to int
}

function decode_string(value) {
    if (typeof value !== 'string' || !/^0x[0-9a-fA-F]+$/.test(value)) {
        throw new Error('Invalid hex string format.');
    }

    // Remove the '0x' prefix and decode the hex string
    const hexWithoutPrefix = value.slice(2);

    // Convert hex to byte array
    const byteArray = [];
    for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
        byteArray.push(String.fromCharCode(parseInt(hexWithoutPrefix.substr(i, 2), 16)));
    }

    // Join byte array to form the string
    const decodedString = byteArray.join('');

    // Remove null padding if present
    return decodedString.replace(/\0/g, '');
}

// minimal contract interaction functions, hard-coded function selectors (check em yourself!)
async function get_num_blog_posts(address) {
    var result = has_web3 ? await eth_call(address, "0x51df1253") : await rpc_call(address, "0x51df1253");
    if (!result) return 0;
    return decode_int(result);
}


async function get_post_html(address, num_post) {
    var post = has_web3 ? await eth_call(address, "0x40731c24" + encode_int(num_post)) : await rpc_call(address, "0x40731c24" + encode_int(num_post));
    if (!post) return "";
    if (post.length < 131) return ""; // empty post
    post = decode_string("0x" + post.slice(130));
    post = parsed_markdown(escape_html(post));
    return post.replaceAll("\n", "<br>");
}

async function get_title(address) {
    var title = has_web3 ? await eth_call(address, "0x4a79d50c") : await rpc_call(address, "0x4a79d50c");
    if (!title || title.length < 131) return "";
    return decode_string("0x" + title.slice(130));
}

function getAnchor() {
    var currentUrl = document.URL,
	urlParts   = currentUrl.split('#');

    return (urlParts.length > 1) ? urlParts[1] : null;
}


// mmain loop: connect to wallet, get number of posts, get posts from chain, display posts
async function run() {
    // display security warning
    // get requsted blog address and check if the query is even sane
    document.getRootNode().getRootNode().body.innerHTML = "[ loading blockchain data ] ........."; // clear no javascript message
    query_string = window.location.search;
    url_params = new URLSearchParams(query_string);
    blog_address = url_params.get('blog');
    if (!is_address_valid(blog_address)) {
        document.getRootNode().getRootNode().body.innerHTML = "Invalid blog address provided. To see examples of how to load an ethblog, <a href='//github.com/pdaian/ethblog/blob/main/README.md'>read our docs</a>."; 
        return;
    }
    // connect to injected ethereum, confirm existence or error
    if (typeof ethereum !== 'undefined') {
        alert("We have detected a web3 wallet. You may be asked to unlock it to read this blog from the chain, this is normal.\n\nTHIS BLOG WILL NEVER ASK YOU TO SIGN ANY TRANSACTIONS.\n\nYou should never sign any transactions from an unknown source.");
        var accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        has_web3 = true;
        if (!Array.isArray(accounts) || accounts.length === 0 || !is_address_valid(accounts[0])) {
            alert('Ethereum wallet handshake failed! Make sure you are logged into your wallet');
            has_web3 = false;
        }
    }

    if (has_errored) return;

    var post_anchor = getAnchor();

    // build HTML with blog title
    var title = (await get_title(blog_address))
    title = escape_html(title);
    post_slug = post_anchor == null ? "" : (" -- Post #" + post_anchor);
    document.title = "ethblog ~ " + title + post_slug
    html = CSS_HEADER + (has_web3 ? "" : CENTRALIZED_WARNING_BANNER) +  "<br><div class='bigger'><h1>" + title + "</h1>" + ethblog_SUB + "</div><br><br>";

    if (post_anchor !== null) html += "<div style='text-align: center;'><a href='index.html?blog=" + blog_address + "'><i>back to home // view all posts</i></a></div>";

    // fetch total number of posts for contract
    blog_posts = (post_anchor == null) ? [...Array(await get_num_blog_posts(blog_address)).keys()].reverse() : [post_anchor];

    // loop through all posts, get post data from chain, parse and append it to the output html
    for (i = 0; i < blog_posts.length; i++) {
        post_text = await get_post_html(blog_address, blog_posts[i]);
        if (post_text === "") continue; // deleted/empty post
        html += "<div class='post'>" + post_text + "</div>";
        html += "<br><div style='text-align: center;'><i>[<a href='#" + blog_posts[i] + "' onclick='window.location.assign(\"index.html?blog=" + blog_address + "#" + blog_posts[i] + "\"); window.location.reload(); return false;'>permalink</a>]</i></div><br><br><hr><br>";
    }
    if (blog_posts.length == 0) html += "<h2 style='text-align:center;'>no posts found :'( try posting something?</h2><br><br>"
    // add footer to output HTML
    html += "<div class='bigger'>" + ethblog_FOOTER + "</div>";
    body_html = html;
    // swap doc HTML to appropriate HTML, display page
    document.getRootNode().getRootNode().body.innerHTML = html;
}
