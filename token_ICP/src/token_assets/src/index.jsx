import ReactDOM from 'react-dom'
import React from 'react'
import App from "./components/App";
import { AuthClient } from "@dfinity/auth-client";

const init = async () => { 
  const authClient = await AuthClient.create();

  if (await authClient.isAuthenticated()){
    console.log("logged in");
    handleAuthenticated(authClient);
  }

  else{
    await authClient.login({
      identityPrivider: "https://identity.ic0.app/#authorize",
      onSuccess: ()=>{
        handleAuthenticated(authClient);
      }
    })
  }

}

async function handleAuthenticated(authClient){
  const idenity = await authClient.getIdentity();
  const userPrincipal = idenity._principal.toString();
  console.log("userPrincipal:");
  console.log(userPrincipal);
  ReactDOM.render(<App loggedInPrincipal = {userPrincipal} />, document.getElementById("root"));
} 

init();


