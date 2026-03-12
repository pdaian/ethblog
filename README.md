# ethblog

ethblog is a principled blogging solution focused on information-dense self-contained content, archived for eternity across various blockchain blockends.

## Description

ethblog is built with several principles/features:

1. **code minimal** -- there is a single javascript file driving the entire presentation layer. the on-chain content is driven by a single, short, readable solidity contract
2. **modular** -- while L1 is currently used for data storage and markdown for parsing, both are modular in the on-chain specification. versioning and linked upgrade list provide an enshrined upgrade path over time as data storage requirements and standards change
3. **free** -- all open source and gpl3 code, written in-house
4. *secure(NOT YET AUDITED)* -- not only is all content limited to markdown that is parsed using a minimal parser and escaped for html attacks, but we also aim to make the entire codebase both auditable and self-contained (no external dependencies, npm, react, etc)
5. **minimal** -- the bare minimum features for presenting and consuming information are provided. this is an opinionated choice, and a call to bloggers to do more with less
6. **no financial incentives** -- you won't see a token, revenue share, or anything like that here
7. **costly creation** -- L1 is used because it forces creators to pay per word, putting ther money where their mouth is as they demand your attention. an average blog post costs between $40 and $200 to post on L1 at today's cost, depending on length
8. **eth native** -- the ticker is ETH
9. **easy to use** -- with frontend portals that are self contained, easy self hosting, and easy posting

... hop on the train today and regain your publishing and hosting freedom!


## Getting Started

The below guide will help you get started, whether you want to read an example blog or start your own

### Reading ethblog

To read an ethblog, you have several options. We will use the example blog deployed at https://etherscan.io/address/0x41Fa80b3D33a308fb46609C6c09608Ed7F4E05c0#code as an example (Phil's real blog!)

#### Using the portal

We provide a Github Pages-based portal for ethblog. You can view our example blog with any browser that has a web3-enabled wallet at this link: https://pdaian.github.io/ethblog/?blog=0x41Fa80b3D33a308fb46609C6c09608Ed7F4E05c0

#### Using self-hosting

To self-host, copy the index.html and ethblog.js files to any HTTPS-enabled remote web server. You now have your own portal into any ethblog. Simply load index.html with the URL parameter `?blog=[eth address]` as a parameter to load that blog.

#### Using direct RPC reads (unformatted)

You can retrieve unformatted posts directly from Ethereum with `eth_call` against the contract on mainnet.

For example, call `getPost(0)` on `0x41fa80b3d33a308fb46609c6c09608ed7f4e05c0` with your preferred Ethereum RPC provider, or use a browser wallet and the included portal which now falls back to a standard JSON-RPC endpoint instead of the old `w3eth.io` gateway.

#### Using etherscan (unformatted)

One side effect of having blogs on chain is you can read them directly on etherscan, until the end of time.

If you don't trust our frontend, head over to the etherscan link above. Hit "Read Contract", and query getPost with postNum 0 (after connecting your wallet using the button) to see the hello world post on our example blog!

### Writing on ethblog

... so you've got a few eth and want to become a writer? Well, the steps could not be easier.
1. Use your choice of IDE or tool to deploy `contracts/eth_l1_md_blog.sol` to the ETH L1 chain. Remix is a good option; copy paste the file, compile it in the compile tab, and use the WalletConnect option under deploy. Set your title carefully in the constructor, it can never be changed.
2. Your deployment account will own the contract by default; you can update this with the owner set function.
3. To create a post, we provide a convenient formatting tool. run `python3 post.py [your post]` (we provide an example post here) and copy-paste the last collapsed line into either etherscan or remix into the arguments of the addPost function.
4. After the transaction is confirmed for (3), your post should show up on every portal running ethblog that is provided the addreess, automatically.

If you have any issues, open one above!


## Security notes

Our HTML escaping has not fully been audited for security, so please be careful loading untrusted blogs. Treat it like loading any untrusted website.

ethblog WILL NEVER ASK YOU TO SIGN ANY KIND OF TRANSACTION. please do not sign any transaction while using the service.

Usual crypto best practices and caution do apply, but the code should be minimal enough to check yourself, tbh.

You can audit the files in this repo with the following command:
```
$ sha512sum ethblog.js index.html post.py example_post.txt contracts/*
ae6a0360a938ea34cf5646549e2c7164080bd8140bd410eb1b76c7808a7642f44cbd5bc26508999308b4d0d5deb385a5e192a2e358e54381a7a044648464e23c  ethblog.js
626026cf9736e08c08047bd3c408a3c51ea6136d62cd5b59933e22b4e392b29bf7b1c7c15c93916b06fe84c287d8f752bebaed90f4689c09fcf0760cd3174913  index.html
038518fdfb3423055d61ad898d3e38338aee69e9990d4bbee6fddcabdce2d1e51b9ce1564cd36521295e6a863104329ec4a52f23495f90895e37d67069aab1ff  post.py
a48217bd6a0865cbdecfbf3757273b39c0022907358d738ef4c593719a0c0a90b71ae75eba47718d57b11610dbe66830e7f702ac9e784ed5525a561ae548f953  example_post.txt
9be1dc2c5a602a7c50722d2e499e7b044e260849caaa351c705b38efb976561cc4ce4700bc84dd930b43da89d9b7db91320b5dac407bdac55c2c898966402a7e  contracts/eth_l1_md_blog.sol
```

ensuring the outputs match the above. Feel free to audit the files for backdoors yourself, they are short, and only index.html and ethblog.js are required for viewing.

## Future work

A few future planned developments!

1. Add blob support for cheaper hosting. Look into persistence in the blob model. Reconcile with existing workstreams.
2. Support L2s that feature long-lived data storage of their on-chain data.
3. UX features! Pagination, and maybe a few more markdown options?

... that's it. we plan to keep it light. this project is finished and self-contained for my use, you can pick it up and fork it or submit PRs as you choose.


## License

This project is licensed under the GNU GPLv3 License - see the LICENSE.md file for details.

## Acknowledgments

thanks to v for creating eth, and for reminding us all that. the ticker is eth
