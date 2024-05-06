import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import {Actor, HttpAgent} from "@dfinity/agent"; 
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenidlFactory} from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import Button from "./button";
import {opend} from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState("");
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPrice] = useState();
  const [loadingHidden, setLoading] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setStatus] = useState();
  const [priceLabel, setLabel] = useState(); 
  const [shouldDisplay, setDisplay] = useState(true);

  const id = props.id;

  const localHost = "http://localhost:8080/";
  // help to run http request to get hold of the canister on the internet
  const agent = new HttpAgent({host: localHost});

  // for local deploy
  agent.fetchRootKey();


  let NFTActor;

  async function loadNFT(){
    NFTActor = await Actor.createActor(idlFactory,{
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageDate = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageDate);
    const image = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png"}));

    setName(name);
    setOwner(owner.toText());
    setImage(image);

    if (props.role == "collection"){
      const nftisListed = await opend.isListed(props.id);
      if( nftisListed){
        setBlur({filter: "blur(4px)"});
        setOwner("OpenC");
        setStatus("SOLD");
      }
      else{
        setButton(
          <Button handleClick = {handleSell} text = "Sell"/>
        );
      }
    }
    else if (props.role == "discover"){
      const originalOwner = await opend.getOriginalOwner(props.id);
      // original owner is not the current user
      if(originalOwner.toText() != CURRENT_USER_ID){
        setButton(
          <Button handleClick = {handleBuy} text = "Buy"/>
        );

        // this price need to be fetched
        const labelPrice = await opend.getListedNFTPrice(props.id);
        setLabel(
          <PriceLabel price ={labelPrice.toString()}/>
        );
      }

    }

  };

  useEffect(()=>{
    loadNFT();
  }, [])  // [] only be called at the first time this component gets rendered 


  let price;
  function handleSell(){
    setPrice(
      <input
        placeholder="Price in DANG"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => price = e.target.value}
      />
    );
    setButton(
      <Button handleClick = {SellItem} text = "comfirm"/>
    );
  }

  async function SellItem(){
    setLoading(false);
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log(listingResult);
    if (listingResult == "Success"){
      const OpencId = await opend.getCanisterId();
      const transferResult = await NFTActor.transferOwnership(OpencId);   
      console.log(transferResult);
      if (transferResult == "Success"){
        setBlur({filter: "blur(4px)"});
        setButton();
        setPrice();
        setStatus("SOLD");
        setOwner("OpenC");
        setLoading(true);
      }
    }
    
  }

  async function handleBuy(){
    console.log("buy was triggered");
    setLoading(false);
    const tokenActor = await Actor.createActor(tokenidlFactory,{
      agent,
      canisterId: Principal.fromText("vvypb-ayaaa-aaaaa-aaa3a-cai"),
    });

    // seller's principal id
    const sellerId = await opend.getOriginalOwner(props.id);
    const itemPrice = await opend.getListedNFTPrice(props.id);   
    
    const Result = await tokenActor.transfer(sellerId, itemPrice);
    if (Result == "Success"){
      // transfer the ownership
      const transferResult = opend.completePurchase(props.id, sellerId, CURRENT_USER_ID);
      console.log(transferResult);
    }
    setLoading(true);
    setDisplay(false); // item disappear once purchase d
  }




  return (
    <div style={{display: shouldDisplay ? "inline": "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
      <div hidden = {loadingHidden} className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner:{owner}
          </p>
          {priceInput}
          {button}
          <span className="purple-text" > {sellStatus}</span>
        </div>
      </div>
    </div>
  );
}

export default Item;
