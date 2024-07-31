import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";
import { myAppMetafieldNamespace, myHandle } from "./constants.js";

const CREATE_GATE_CONFIGURATION_MUTATION = `
  mutation createGateConfiguration($name: String!, $requirements: String!, $reaction: String!, $productGids: String!) {
    gateConfigurationCreate(input: {
        name: $name,
        metafields: [{
          namespace: "${myAppMetafieldNamespace}",
          key: "requirements",
          type: "json",
          value: $requirements
        },
        {
          namespace: "${myAppMetafieldNamespace}",
          key: "reaction",
          type: "json",
          value: $reaction
        },
        {
          namespace: "${myAppMetafieldNamespace}",
          key: "productGids",
          type: "json",
          value: $productGids,
        }],
        handle: "${myHandle}"
      }) {
      gateConfiguration {
        id
        name
        createdAt
        updatedAt
        metafields(namespace: "${myAppMetafieldNamespace}", first: 10) {
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

const CREATE_GATE_SUBJECT_MUTATION = `
  mutation createGateSubject ($gateConfigurationId: ID!, $subject: ID!){
    gateSubjectCreate(input: {
      gateConfigurationId: $gateConfigurationId,
      active: true,
      subject: $subject
    }) {
      gateSubject {
        id
        configuration {
          id
          name
          requirements: metafield(namespace: "${myAppMetafieldNamespace}",
            key: "requirements") {
              value
          }
          reaction: metafield(namespace: "${myAppMetafieldNamespace}",
            key: "reaction") {
              value
          }
          productGids: metafield(namespace: "${myAppMetafieldNamespace}", key: "productGids"){
            value
          }
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_GATE_SUBJECT_MUTATION = `
  mutation updateGateSubject ($gateConfigurationId: ID!, $id: ID!){
    gateSubjectUpdate(input: {
      gateConfigurationId: $gateConfigurationId,
      id: $id,
    }) {
      gateSubject {
        id
        configuration {
          id
          name
          requirements: metafield(namespace: "${myAppMetafieldNamespace}",
            key: "requirements") {
              value
          }
          reaction: metafield(namespace: "${myAppMetafieldNamespace}",
            key: "reaction") {
              value
          }
          productGids: metafield(namespace: "${myAppMetafieldNamespace}",
            key: "productGids"){
              value
          }
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CREATE_PRODUCT_METAFIELD_MUTATION = `
  mutation updateProductMetafield($productId: ID!, $metafieldValue: String!) {
    productUpdate(input: {
      id: $productId,
      metafields:[
        {
          namespace: "${myAppMetafieldNamespace}",
          key: "gate",
          type: "json",
          value: $metafieldValue
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

const UPDATE_GATE_CONFIGURATION_MUTATION = `
  mutation gateConfigurationUpdate($input: GateConfigurationUpdateInput!) {
    gateConfigurationUpdate(input: $input) {
      userErrors {
        field
        message
      }
      gateConfiguration {
        id
        name
        metafields(namespace: "${myAppMetafieldNamespace}", first: 10) {
          nodes {
            key
            value
            namespace
            type
          }
        }
      }
    }
  }
`;

// const UPDATE_GATE_CONFIGURATION_MUTATION = `
//   mutation UpdateGateConfiguration($name: String!, $requirements: String!, $reaction: String!, $productGids: String!) {
//     gateConfigurationUpdate(input: {
//         name: $name,
//         metafields: [{
//           namespace: "${myAppMetafieldNamespace}",
//           key: "productGids",
//           type: "json",
//           value: $productGids,
//         }],
//         handle: "${myHandle}"
//       }) {
//       gateConfiguration {
//         id
//         name
//         createdAt
//         updatedAt
//         metafields(namespace: "${myAppMetafieldNamespace}", first: 10) {
//           nodes {
//             key
//             value
//             namespace
//             type
//           }
//         }
//       }
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;

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
        configuration{
          id
          name
          productGids: metafield(namespace: "${myAppMetafieldNamespace}",
            key: "productGids"){
              id
              value
          }
        }
      }
    }
  }
}
`;

const GET_PRODUCT_METAFIELD_QUERY = `
  query getProductMetafield($productId: ID!) {
    product(id: $productId) {
      title
      metafield(namespace: "${myAppMetafieldNamespace}", key: "gate") {
        id
        value
      }
    }
  }
`;


// here to update the gate content
// retrieving the datas from the create tokengate form in the frontend
export default async function createGate({
  session,
  name,
  network,
  contractAddress,
  productGids,
  issuer,
  taxon,
}) {
  const client = new shopify.api.clients.Graphql({ session });

  const segmentConditions = {
    name: name,
    network: network,
    contractAddress: contractAddress,
    issuer: issuer,
    taxon: taxon,
  };

  const gateConfigurationRequirements = {
    conditions: segmentConditions,
  };

  const gateConfigurationReaction = {
    name: name,
    type: "exclusive",
  };

  try {
    console.log('PRODUCT GIDS: ', productGids)
    const createGateResponse = await client.query({
      data: {
        query: CREATE_GATE_CONFIGURATION_MUTATION,
        variables: {
          name,
          requirements: JSON.stringify(gateConfigurationRequirements),
          reaction: JSON.stringify(gateConfigurationReaction),
          productGids: JSON.stringify(productGids),
        },
      },
    });
    const gateConfiguration =
      createGateResponse.body.data.gateConfigurationCreate.gateConfiguration;
    const gateConfigurationId = gateConfiguration.id;

    if (productGids.length === 0) {
      return;
    }

    console.log('createGateResponse')
    const retrieveProductsResponse = await client.query({
      data: {
        query: PRODUCTS_QUERY,
        variables: {
          queryString: generateProductsQueryString(productGids),
          first: 100,
        },
      },
    });
    console.log('retrieveProductsResponse')
    const products = retrieveProductsResponse.body.data.products.nodes;


    // updating products to have only one gate per product
    for (const product of products) {
      const metafieldValue = JSON.stringify({
        gated: true,
        gateConfigurationId,
        name,
        requirements: gateConfigurationRequirements,
        reaction: gateConfigurationReaction,
      });

      const testflag = true

      for (const product of products) {
        console.log('retrieve metafield of product: ', product.id)
        const productMetafield = await getProductMetafield({ session, productId: product.id });
        console.log('productMetafield', product.id, ':', productMetafield);
        //product.gates.length > 0 
        
        if (productMetafield?.metafield?.id && product.gates.length > 0 ) {
          console.log('update gate')
          console.log('product.gates[0]?.configuration?.productGids: ', product.gates[0]?.configuration)
          const gateProductGids = JSON.parse(product.gates[0]?.configuration?.productGids.value);
          const gateProductGidsMetafieldID = product.gates[0]?.configuration?.productGids.id
          console.log('-----> gateProductGids <-----: ', gateProductGids)
          console.log('product gids to update ', productGids) // list. of product choosed by user
          const updateProductGid = null;
          const activeGateSubjectId = product.gates[0].id;
          const gateProductUpdate = gateProductGids.filter(gateProduct => gateProduct !== product.id)
          console.log('======> testProductUpdate: ', gateProductUpdate)

          
          const currentGateConfigurationId = product.gates[0]?.configuration.id;
          const currentGateConfigurationName = product.gates[0]?.configuration.name 
          console.log('currentGateConfigurationId: ', currentGateConfigurationId)

          const input = {
            id: currentGateConfigurationId,
            name: currentGateConfigurationName,
            metafields: [
              {
                namespace: myAppMetafieldNamespace,
                key: "productGids",
                type: "json",
                value: JSON.stringify(gateProductUpdate),
              }
            ]
          };
          console.log('input: ', input)

          console.log('gateProductGidsMetafieldID: ', gateProductGidsMetafieldID)

          const productGidsUpdateQuery = await client.query({
            data: {
              "query": `mutation gateConfigurationUpdate($input: GateConfigurationUpdateInput!) {
                gateConfigurationUpdate(input: $input) {
                  userErrors {
                    field
                    message
                  }
                  gateConfiguration {
                    id
                    name
                  }
                }
              }`,
              "variables": {
                "input": {
                  "id": `${currentGateConfigurationId}`,
                  "name": `${currentGateConfigurationName}`,
                  "metafields": {
                    "id": `${gateProductGidsMetafieldID}`,
                    "key": "productGids",
                    "namespace": `${myAppMetafieldNamespace}`,
                    "type": "json",
                    "value": JSON.stringify(gateProductUpdate)
                  }
                }
              },
            },
          });

          console.log('productGidsUpdateQuery: ', productGidsUpdateQuery.body.data)

          await client.query({
            data: {
              query: UPDATE_GATE_SUBJECT_MUTATION,
              variables: {
                gateConfigurationId,
                id: activeGateSubjectId,
              },
            },
          }); 
          console.log(' metafieldId: product?.metafield.id: ',  productMetafield?.metafield?.id)
          const updateMetafieldResponse = await client.query({
            data: {
              query: UPDATE_PRODUCT_METAFIELD_MUTATION,
              variables: {
                productId: product.id,
                metafieldValue: metafieldValue,
                metafieldId: productMetafield?.metafield?.id
              },
            },
          });
          console.log('Updated product metafield: ', updateMetafieldResponse.body?.data.productUpdate.product);
        } else {
          console.log('create gate')
          await client.query({
            data: {
              query: CREATE_GATE_SUBJECT_MUTATION,
              variables: {
                gateConfigurationId,
                subject: product.id,
              },
            },
          });

          const updateMetafieldResponse = await client.query({
            data: {
              query: CREATE_PRODUCT_METAFIELD_MUTATION,
              variables: {
                productId: product.id,
                metafieldValue: metafieldValue,
              },
            },
          });
          console.log('Updated product metafield: ', updateMetafieldResponse.body?.data.productUpdate.product.metafields);
          const retrieveProductsResponse = await client.query({
            data: {
              query: PRODUCTS_QUERY,
              variables: {
                queryString: generateProductsQueryString(productGids),
                first: 100,
              },
            },
          });
          const testProducts = retrieveProductsResponse.body.data.products.nodes;
          console.log('testProducts: ', testProducts)
        }
      }

      
    }
    return createGateResponse;
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

export async function getProductMetafield({ session, productId }) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    console.log('product ID metafield query delete: ', productId)
    const response = await client.query({
      data: {
        query: GET_PRODUCT_METAFIELD_QUERY,
        variables: {
          productId,
        },
      },
    });
    console.log('GET_PRODUCT_METAFIELD_QUERY: ', response.body.data)

    const metafield = response.body.data.product;
    console.log('Metafield value:', metafield);
    return metafield;
  } catch (error) {
    console.log(error)
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}

const generateProductsQueryString = (productGids) => {
  return productGids
    .map((productGid) => {
      const id = productGid.split("/").pop();
      return `(id:${id})`;
    })
    .join(" OR ");
};
