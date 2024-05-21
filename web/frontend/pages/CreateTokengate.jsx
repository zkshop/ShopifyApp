import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LegacyCard,
  Form,
  Page,
  PageActions,
  Text,
  ChoiceList,
  Button
} from "@shopify/polaris";
import { TextField } from '@shopify/polaris';
import { ContextualSaveBar, Toast } from "@shopify/app-bridge-react";
import { useField, useForm } from "@shopify/react-form";
import { useAuthenticatedFetch } from "../hooks";
import { TokengatesResourcePicker } from "../components/TokengatesResourcePicker";

// import shopify from "../../shopify.js";

export default function CreateTokengate() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [toastProps, setToastProps] = useState({ content: null });
  const selectedNetworkRef = useRef('Ethereum');

  const fieldsDefinition = {
    name: useField({
      value: undefined,
      validates: (name) => !name && "Name cannot be empty",
    }),
    network: useField({
      value: 'Ethereum',
      validates: (network) => !network && "Network must be selected",
    }),
    issuer: useField({
      value: undefined,
      validates: (issuer) => {
        const currentNetwork = selectedNetworkRef.current;
        return currentNetwork === 'XRP' && !issuer && "Issuer cannot be empty";
      },
    }),
    taxon: useField({
      value: undefined,
      validates: (taxon) => {
        const currentNetwork = selectedNetworkRef.current;
        return currentNetwork === 'XRP' && !taxon && "Taxon cannot be empty";
      },
    }),
    contractAddress: useField({
      value: undefined,
      validates: (address) => {
        const currentNetwork = selectedNetworkRef.current;
        return currentNetwork !== 'XRP' && !address && "Contract Address cannot be empty";
      }
    }),
    products: useField([]),
    exclusiveContent: useField(false),
  };

  const { fields, submit, submitting, dirty, reset, makeClean } = useForm({
    fields: fieldsDefinition,
    onSubmit: async (formData) => {
      const { name, products, issuer, taxon, exclusiveContent, network, contractAddress } = formData;

      const productGids = products.map((product) => product.id);
      
      const body = {
        name,
        network,
        contractAddress,
        productGids,
        issuer,
        taxon,
        exclusiveContent,
      };

      const response = await fetch("/api/gates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setToastProps({ content: "Tokengate created" });
        makeClean();
        navigate("/tokengates");
      } else {
        setToastProps({
          content: "There was an error creating a tokengate",
          error: true,
        });
      }
    },
  });

  // async function createRule() {
  //   const price_rule = new shopify.rest.PriceRule({session: session});

  //   price_rule.title = "Test Rule";
  //   price_rule.value_type = "percentage";
  //   price_rule.value = "-1.0";
  //   price_rule.customer_selection = "all";
  //   price_rule.target_type = "line_item";
  //   price_rule.target_selection = "entitled";
  //   price_rule.allocation_method = "each";
  //   price_rule.entitled_product_ids = [
  //     921728736
  //   ];
  //   const response = await price_rule.save({
  //     update: true,
  //   });
    
  //   console.log(response);

  //   if (response.price_rule && response.price_rule.id) {
  //     await shopify.rest.PriceRule.delete({
  //       session: session,
  //       id: response.price_rule.id,
  //     });
  //   }
  // }

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps({ content: null })} />
  );

  return (
    <Page
      narrowWidth
      backAction={{
        content: "Go back",
        onAction: () => {
          navigate("/tokengates");
        },
      }}
      title="Create a new Tokengate"
    >
          <Form onSubmit={submit}>
            <ContextualSaveBar
              saveAction={{
                onAction: submit,
                disabled: submitting || !dirty,
                loading: submitting,
              }}
              discardAction={{
                onAction: reset,
              }}
              visible={dirty}
            />
            {toastMarkup}
            <LegacyCard>
              <LegacyCard.Section>
                    <Text variant="headingXl" as="h4">
                      General
                    </Text>                   
                    <TextField
                      name="name"
                      label="Name of the gate"
                      type="text"
                      {...fields.name}
                      autoComplete="off"
                      />
              </LegacyCard.Section>
              <LegacyCard.Section>
                    <Text variant="headingXl" as="h4">
                      Gating
                    </Text>
                    <ChoiceList
                      title="Select a Blockchain Standard"
                      choices={[
                        { label: 'Ethereum', value: 'Ethereum' },
                        { label: 'Polygon', value: 'Polygon' },
                        { label: 'Base', value: 'Base' },
                        { label: 'XRP', value: 'XRP' }
                      ]}
                      selected={[fields.network.value]}
                      onChange={(value) => {
                        fields.network.onChange(value[0]);
                        selectedNetworkRef.current = value[0];
                      }}
                      style={{ display: 'flex', justifyContent: 'space-between' }}
                    />
                    {selectedNetworkRef.current === 'XRP' && (
                      <>
                        <TextField
                          name="issuer"
                          label="Issuer"
                          type="text"
                          {...fields.issuer}
                          autoComplete="off"
                          />
                        <TextField
                          name="taxon"
                          label="Taxon"
                          type="text"
                          {...fields.taxon}
                          autoComplete="off"
                          />
                      </>
                    )}
                    {selectedNetworkRef.current !== 'XRP' && (
                      <TextField
                        name="contractAddress"
                        label="Contract Address"
                        type="text"
                        {...fields.contractAddress}
                        autoComplete="off"
                        />
                    )}
              </LegacyCard.Section>
            </LegacyCard>
              <LegacyCard>
                <TokengatesResourcePicker products={fields.products} />
              </LegacyCard>
              {/* <LegacyCard>
                <LegacyCard.Section>
                <Button onClick={createRule}>Create Rule</Button>
                </LegacyCard.Section>
              </LegacyCard> */}
              <LegacyCard.Section>
                <PageActions
                  primaryAction={{
                    content: "Save",
                    disabled: submitting || !dirty,
                    loading: submitting,
                    onAction: submit,
                  }}
                />
              </LegacyCard.Section>
          </Form>
    </Page>
  );
}

