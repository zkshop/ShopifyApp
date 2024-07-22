import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";
import { myAppMetafieldNamespace, myHandle } from "./constants.js";

const CREATE_GATE_CONFIGURATION_MUTATION = `
  mutation createGateConfiguration($name: String!, $requirements: String!, $reaction: String!) {
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
      id: $id
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

const UPDATE_PRODUCT_METAFIELD_MUTATION = `
  mutation updateProductMetafield($productId: ID!, $metafieldValue: String!) {
    productUpdate(input: {
      id: $productId,
      metafields: [
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



const PRODUCTS_QUERY = `
query retrieveProducts ($queryString: String!, $first: Int!){
  products(query: $queryString, first: $first) {
    nodes {
      id
      gates {
        id
        active
      }
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
    const createGateResponse = await client.query({
      data: {
        query: CREATE_GATE_CONFIGURATION_MUTATION,
        variables: {
          name,
          requirements: JSON.stringify(gateConfigurationRequirements),
          reaction: JSON.stringify(gateConfigurationReaction),
        },
      },
    });
    const gateConfiguration =
      createGateResponse.body.data.gateConfigurationCreate.gateConfiguration;
    const gateConfigurationId = gateConfiguration.id;

    if (productGids.length === 0) {
      return;
    }

    const retrieveProductsResponse = await client.query({
      data: {
        query: PRODUCTS_QUERY,
        variables: {
          queryString: generateProductsQueryString(productGids),
          first: 100,
        },
      },
    });
    const products = retrieveProductsResponse.body.data.products.nodes;

    // updating products to have only one gate per product
    for (const product of products) {
      const metafieldValue = JSON.stringify({
        gateConfigurationId,
        name,
        requirements: gateConfigurationRequirements,
        reaction: gateConfigurationReaction,
      });

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
          query: UPDATE_PRODUCT_METAFIELD_MUTATION,
          variables: {
            productId: product.id,
            metafieldValue: metafieldValue,
          },
        },
      });
      
      console.log('Updated product metafield: ', updateMetafieldResponse.body?.data.productUpdate.product.metafields);
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

const generateProductsQueryString = (productGids) => {
  return productGids
    .map((productGid) => {
      const id = productGid.split("/").pop();
      return `(id:${id})`;
    })
    .join(" OR ");
};
