import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";
import { myAppMetafieldNamespace } from "./constants.js";
import retrieveGates from './retrieve-gates.js'
import { getProductMetafield } from './create-gate.js'

const DELETE_GATE_CONFIGURATION_MUTATION = `
  mutation deleteGateConfiguration($id: ID!) {
    gateConfigurationDelete(input: {
      id: $id
    }) {
      deletedGateConfigurationId
    }
  }
`;


const generateProductsQueryString = (productGids) => {
  return productGids
    .map((productGid) => {
      const id = productGid.split("/").pop();
      return `(id:${id})`;
    })
    .join(" OR ");
};

const PRODUCTS_QUERY = `
query retrieveProducts ($queryString: String!, $first: Int!){
  products(query: $queryString, first: $first) {
    nodes {
      id
      metafield(key: "gate"){
        id
        key
        namespace
      }
      gates {
        id
        active
      }
    }
  }
}
`;

const DELETE_METAFIELD_MUTATION = `
  mutation metafieldDelete($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_PRODUCT_METAFIELD_MUTATION = `
  mutation updateProductMetafield($metafieldId: ID! $productId: ID! $metafieldValue: String!) {
    productUpdate(input: {
      id: $productId,
      metafields:[
        {
          id: $metafieldId,
          type: "json",
          value: $metafieldValue,
        }
      ]
    }) {
      product {
        id
        metafields(namespace: "${myAppMetafieldNamespace}", first: 100) {
          nodes {
            key
            value
            namespace
            type
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;




export default async function deleteGate({ session, gateConfigurationGid, products }) {
  const client = new shopify.api.clients.Graphql({ session });
  try {
    console.log('delete gate')
    const productsResponse = await retrieveGates(session);
    console.log('productsResponse: ', productsResponse[0]?.productGids.value)
    const parsedProducts = JSON.parse(productsResponse[0]?.productGids.value)
    console.log('parsedProducts: ', parsedProducts)
    const newProductGids = generateProductsQueryString(parsedProducts)
    console.log('newProductGids: ', newProductGids)

    const retrieveProductsResponse = await client.query({
      data: {
        query: PRODUCTS_QUERY,
        variables: {
          queryString: generateProductsQueryString(parsedProducts),
          first: 100,
        },
      },
    });
    console.log('retrieveProductsResponse: ', retrieveProductsResponse)
    
    const products = retrieveProductsResponse.body.data.products.nodes;
    console.log('products:  ', products)
    for (const product of products) {
      const productMetafield = await getProductMetafield({ session, productId: product.id });
      console.log("productMetafield, ", productMetafield)
      if(productMetafield){
        const deleteMetafieldResponse = await client.query({
          data: {
            query: DELETE_METAFIELD_MUTATION,
            variables: {
              input: {
                id: productMetafield?.metafield?.id
              }
            },
          },
        });
        console.log('deleteMetafieldResponse: ', deleteMetafieldResponse)
      }
      else{
        return
      }
    }
    //return
    const response = await client.query({
      data: {
        query: DELETE_GATE_CONFIGURATION_MUTATION,
        variables: {
          id: gateConfigurationGid,
        },
      },
    });
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
