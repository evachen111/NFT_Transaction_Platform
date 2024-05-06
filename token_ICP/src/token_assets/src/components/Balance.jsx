import React, { useState } from "react";
import { Principal } from '@dfinity/principal';
import {token} from "../../../declarations/token";

function Balance() {

  const [inputValue, setInput] = useState("");
  const [balance, setBalance] = useState("null");
  const [symbol, setSymbol] = useState("");
  const [hidden, setHidden] = useState(true);

  // function setInput(e){

  // }

  
  async function handleClick() {
    const principal = Principal.fromText(inputValue);
    const balance = await token.balanceOf(principal);
    setBalance(balance.toLocaleString());
    const symbol = await token.getSymbal();
    setSymbol(symbol);
    setHidden(false);
  }


  return (
    <div className="window white">
      <label>Check account token balance:</label>
      <p>  
        <input
          id="balance-principal-id" 
          type="text"
          placeholder="Enter a Principal ID"
          value = {inputValue}
          onChange={(e) => setInput(e.target.value)}
        />
      </p>
      <p className="trade-buttons">
        <button
          id="btn-request-balance"
          onClick={handleClick}
        >
          Check Balance
        </button>
      </p>
      <p hidden = {hidden}>This account has a balance of {balance} {symbol}.</p>
    </div>
  );
}

export default Balance;
