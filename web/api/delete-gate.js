import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";
import { myAppMetafieldNamespace } from "./constants.js";


const DELETE_GATE_CONFIGURATION_MUTATION = `
  mutation deleteGateConfiguration($id: ID!) {
    gateConfigurationDelete(input:{
      id: $id
    }) {
      deletedGateConfigurationId
    }
  }
`;


const PRODUCTS_QUERY_BY_GATE = `
  query retrieveProductsByGate($gateConfigurationId: ID!) {
    products(query: "metafields.${myAppMetafieldNamespace}.gate.gateConfigurationId:$gateConfigurationId", first: 100) {
      edges {
        node {
          id
          metafields(namespace: "${myAppMetafieldNamespace}") {
            edges {
              node {
                id
                key
                namespace
              }
            }
          }
        }
      }
    }
  }
`;



const DELETE_PRODUCT_METAFIELD_MUTATION = `
  mutation deleteProductMetafield($metafieldId: ID!) {
    metafieldDelete(input: {
      id: $metafieldId
    }) {
      deletedId
    }
  }
`;
export default async function deleteGate({ session, gateConfigurationGid }) {
  const client = new shopify.api.clients.Graphql({ session });
  try {
    const productsResponse = await client.query({
      data: {
        query: PRODUCTS_QUERY_BY_GATE,
        variables: {
          gateConfigurationId: gateConfigurationGid,
        },
      },
    });

    const products = productsResponse.body.data.products.edges;
    console.log('products to delete: ', products)

    const response = await client.query({
      data: {
        query: DELETE_GATE_CONFIGURATION_MUTATION,
        variables: {
          id: gateConfigurationGid,
        },
      },
    });

    for (const product of products) {
      const metafields = product.node.metafields.edges;
      for (const metafield of metafields) {
        if (metafield.node.key === "gate" && metafield.node.namespace === myAppMetafieldNamespace) {
          await client.query({
            data: {
              query: DELETE_PRODUCT_METAFIELD_MUTATION,
              variables: {
                metafieldId: metafield.node.id,
              },
            },
          });
        }
      }
    }
    return response.body.data.gateConfigurationDelete;
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}
