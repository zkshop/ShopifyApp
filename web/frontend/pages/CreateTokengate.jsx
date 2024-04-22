import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LegacyCard,
  Form,
  Layout,
  Page,
  PageActions,
  TextContainer,
} from "@shopify/polaris";
import { TextField } from '@shopify/polaris';
import { ContextualSaveBar, Toast } from "@shopify/app-bridge-react";
import { useField, useForm } from "@shopify/react-form";
import { useAuthenticatedFetch } from "../hooks";
import { TokengatesResourcePicker } from "../components/TokengatesResourcePicker";

export default function CreateTokengate() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [toastProps, setToastProps] = useState({ content: null });

  const fieldsDefinition = {
    name: useField({
      value: undefined,
      validates: (name) => !name && "Name cannot be empty",
    }),
    issuer: useField({
      value: undefined,
      validates: (issuer) => !issuer && "Issuer cannot be empty",
    }),
    taxon: useField({
      value: undefined,
      validates: (taxon) => !taxon && "Taxon cannot be empty",
    }),
    products: useField([]),
    exclusiveContent: useField(false),
  };

  const { fields, submit, submitting, dirty, reset, makeClean } = useForm({
    fields: fieldsDefinition,
    onSubmit: async (formData) => {
      const { name, products, issuer, taxon, exclusiveContent } = formData;

      const productGids = products.map((product) => product.id);

      const body = {
        name,
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

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps({ content: null })} />
  );

  return (
    <Page
      narrowWidth
      breadcrumbs={[
        {
          content: "Go back",
          onAction: () => {
            navigate("/tokengates");
          },
        },
      ]}
      title="Create a new Tokengate"
    >
      <Layout>
        <Layout.Section>
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
            <Layout>
              <Layout.Section>
                <LegacyCard>
                  <LegacyCard.Section>
                    <TextContainer>
                      <TextField
                        name="name"
                        label="Name of the gate"
                        type="text"
                        {...fields.name}
                        autoComplete="off"
                      />
                    </TextContainer>
                  </LegacyCard.Section>
                  <LegacyCard.Section title="XRP SEGMENT">
                    <Layout distribution="fillEvenly">
                      <Layout.Item>
                        <TextField
                          name="issuer"
                          label="Issuer"
                          type="text"
                          {...fields.issuer}
                          autoComplete="off"
                        />
                      </Layout.Item>
                      <Layout.Item>
                        <TextField
                          name="taxon"
                          label="Taxon"
                          type="text"
                          {...fields.taxon}
                          autoComplete="off"
                        />
                      </Layout.Item>
                    </Layout>
                  </LegacyCard.Section>
                </LegacyCard>
              </Layout.Section>
              <Layout.Section>
                <TokengatesResourcePicker products={fields.products} />
              </Layout.Section>
              <Layout.Section>
                <PageActions
                  primaryAction={{
                    content: "Save",
                    disabled: submitting || !dirty,
                    loading: submitting,
                    onAction: submit,
                  }}
                />
              </Layout.Section>
            </Layout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}


