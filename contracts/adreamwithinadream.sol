// SPDX-License-Identifier: MIT

pragma solidity >= 0.8.11;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token//ERC20/IERC20.sol";
import "@manifoldxyz/royalty-registry-solidity/contracts/specs/IEIP2981.sol";
import "@manifoldxyz/libraries-solidity/contracts/access/AdminControl.sol";


/////////////////////////////////////
//                                 //
//                                 //
//    'a dream within a dream'     //
//                                 //
//    by @the_grecu                //
//    & @smartcontrart             //
//                                 //
//                                 //
/////////////////////////////////////


contract adreamwithinadream is Ownable, IEIP2981, ERC721URIStorage, AdminControl {
    
    using Counters for Counters.Counter;
    mapping (uint256 => uint256) _urisByToken;
    mapping (address => uint256) public _tokensWhitelisted;
    mapping (address => uint256) public _tokensClaimed;

    string [] _uris;
    uint256 public ashPrice = 15000000000000000000; // 15 ASH
    uint256 _royalties_amount; 
    address public ashContract = 0x64D91f12Ece7362F91A6f8E7940Cd55F05060b92;
    address _royalties_recipient;

    Counters.Counter private _nextTokenId;

    constructor () ERC721("adreamwithinadream", "dream") {
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AdminControl)
        returns (bool)
    {
        return
        AdminControl.supportsInterface(interfaceId) ||
        ERC721.supportsInterface(interfaceId) ||
        interfaceId == type(IEIP2981).interfaceId ||
        super.supportsInterface(interfaceId);
    }

    function mint(
        address account,
        uint256 tokenQuantity
    ) external{
        require(_uris.length > 0 && tokenQuantity > 0, "Add a URI before minting and mint a positive number of tokens");
        require( _tokensClaimed[account] + tokenQuantity <= _tokensWhitelisted[account] || isAdmin(msg.sender), "You are not whitelisted for that many tokens!");
        if(!isAdmin(msg.sender)){
            IERC20(ashContract).transferFrom(msg.sender, _royalties_recipient, ashPrice * tokenQuantity);
        }
        for(uint256 i = 1; i <= tokenQuantity; i++){
            _nextTokenId.increment();
            uint256 tokenId = _nextTokenId.current();
            _safeMint(account, tokenId);
            _urisByToken[tokenId] = 0;
            _setTokenURI(tokenId, _uris[0]);
            _tokensClaimed[account] += 1; 
        }
    }

    function mintSpecial(address account, string calldata uri) external adminRequired{
        _nextTokenId.increment();
        uint256 tokenId = _nextTokenId.current();
        _safeMint(account, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function loadWL(
        address[] calldata _whitelistedAddresses, 
        uint256[] calldata _amount
    )external adminRequired{
        for(uint256 i; i<_whitelistedAddresses.length; i++){
            _tokensWhitelisted[_whitelistedAddresses[i]] = _amount[i];
        }
    }

    function updateURIs(string [] calldata uris) public adminRequired{
        delete _uris;
        for(uint256 i=0; i < uris.length; i++){
            _uris.push(uris[i]);
        }
    }

    function getURIs()public view adminRequired returns ( string [] memory){
        return _uris;
    }
    

    function _incrementURI(
        uint256 tokenId
    ) private {
        _urisByToken[tokenId] = _urisByToken[tokenId] + 1;
        _setTokenURI(tokenId, _uris[_urisByToken[tokenId]]);
    }

   function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        if(to != address(0) && from != address(0)){
            if(_urisByToken[tokenId] < _uris.length - 1){
                _incrementURI(tokenId);
            }
        }
    }

    function burn(uint256 tokenId) public {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721Burnable: caller is not owner nor approved");
        _burn(tokenId);
    }

    function setRoyalties(address _recipient, uint256 _amount) external adminRequired {
        _royalties_recipient = _recipient;
        _royalties_amount = _amount;
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice) public override view returns (address, uint256) {
        if(tokenId <= _nextTokenId.current() && _royalties_recipient != address(0)){
            return (_royalties_recipient, (salePrice * _royalties_amount) / 100 );
        }
        return (address(0), 0);
    }

    function withdraw(address recipient) external adminRequired {
        payable(recipient).transfer(address(this).balance);
    }

}