import shopify from "../../shopify.js";

export async function createAppSubscription(session){
    console.log('----> create subscription ')
    console.log('session: ', session)
    const client = new shopify.api.clients.Graphql({ session });
    console.log('client: ', client)
    console.log('host: ', process.env.HOST)
    const data = await client.query({
    data: {
        "query": `mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!) {
        appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems) {
            userErrors {
            field
            message
            }
            appSubscription {
            id
            }
            confirmationUrl
        }
        }`,
        "variables": {
        "name": "Basic Plan",
        "returnUrl": `${process.env.HOST}`,
        "lineItems": [
            {
            "plan": {
                "appRecurringPricingDetails": {
                "price": {
                    "amount": 9.99,
                    "currencyCode": "USD"
                },
                "interval": "EVERY_30_DAYS"
                }
            }
            }
        ]
        },
    },
    });
    console.log('data: ', data)
    return data;
}

export async function cancelSubscription(id){
    console.log('---> cancel subscription')
    const client = new shopify.clients.Graphql({session});
    const data = await client.query({
    data: {
        "query": `mutation AppSubscriptionCancel($id: ID!) {
        appSubscriptionCancel(id: $id) {
            userErrors {
            field
            message
            }
            appSubscription {
            id
            status
            }
        }
        }`,
        "variables": {
        "id": "gid://shopify/AppSubscription/1029266955"
        },
    },
    });
}

export async function getSubscription(){
    const client = new shopify.api.clients.Graphql({ session });
}
