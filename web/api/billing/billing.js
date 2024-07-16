import shopify from "../../shopify.js";

export async function createAppSubscription(session){
    console.log('----> create subscription ')
    console.log('session: ', session)
    const client = new shopify.api.clients.Graphql({ session });
    console.log('client: ', client)
    console.log('host: ', process.env.HOST)
    const data = await client.query({
    data: {
        "query": `mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean!) {
        appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test: $test) {
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
        "test": false,
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
    const client = new shopify.api.clients.Graphql({session});
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


export async function getAppInfo(session){
    console.log('----> getAppInfo subscription ')
    console.log('session: ', session)
    const client = new shopify.api.clients.Graphql({ session });
    console.log('client: ', client)
    console.log('host: ', process.env.HOST)
    const data = await client.query({
        data: {
            query: `
                query {
                    currentAppInstallation {
                        activeSubscriptions{
                            createdAt
                            currentPeriodEnd
                            id
                            status
                            test
                        }
                    }
                }
            `,
        },
    });
    console.log('data: ', data.json)
    return data;
}
