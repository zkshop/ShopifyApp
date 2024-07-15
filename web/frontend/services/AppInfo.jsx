import { useAuthenticatedFetch, useAppQuery } from "../hooks";
import { useAppBridge } from '@shopify/app-bridge-react';





export async function getAppInfo(){
    console.log('getAppInfo: ', getAppInfo)
    const fetch = useAuthenticatedFetch();
    const app = useAppBridge(); 
    try{
        const response = await fetch("/api/info", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
        const jsonResponse = await response.json();
        console.log('jsonResponse: ', jsonResponse)
        return jsonResponse;
    }catch(err){
        
    }
}