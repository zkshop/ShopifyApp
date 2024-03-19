import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  ButtonGroup,
  LegacyCard,
  Form,
  Heading,
  Layout,
  Page,
  PageActions,
  Stack,
  TextContainer,
  TextField,
} from "@shopify/polaris";
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
    discountType: useField("percentage"),
    discount: useField({
      value: undefined,
      validates: (discount) => !fields.exclusiveContent.value && !discount && "Discount cannot be empty",
    }),
    // segment: useField({
    //   value: undefined,
    //   validates: (segment) => !segment && "Segment cannot be empty",
    // }),
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
      const { discountType, discount, name, products, issuer, taxon, exclusiveContent } = formData;

      const productGids = products.map((product) => product.id);

      const body = {
        name,
        productGids,
        // segment: segment.split(","),
        issuer,
        taxon,
        exclusiveContent,
      };
      
      if (!exclusiveContent) {
        body.discountType = discountType;
        body.discount = discount;
      }

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
        navigate("/");
      } else {
        setToastProps({
          content: "There was an error creating a tokengate",
          error: true,
        });
      }
    },
  });

  const handleDiscountTypeButtonClick = useCallback((type) => {
    if (type === "exclusiveContent") {
      fields.exclusiveContent.onChange(true);
      fields.discountType.onChange("");
      fields.discount.onChange("");
    } else {
      fields.exclusiveContent.onChange(false);
      fields.discountType.onChange(type);
    }
  }, [fields.discountType, fields.exclusiveContent]);  

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
            navigate("/");
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
                      <Heading>Configuration</Heading>
                      <TextField
                        name="name"
                        label="Name of the gate"
                        type="text"
                        {...fields.name}
                        autoComplete="off"
                      />
                    </TextContainer>
                  </LegacyCard.Section>
                  <LegacyCard.Section title="DISCOUNT PERK">
                    <Stack>
                      <Stack.Item>
                      <ButtonGroup segmented>
                        <Button
                          pressed={fields.discountType.value === "percentage" && !fields.exclusiveContent.value}
                          onClick={() => handleDiscountTypeButtonClick("percentage")}
                        >
                          Percentage
                        </Button>
                        <Button
                          pressed={fields.discountType.value === "amount" && !fields.exclusiveContent.value}
                          onClick={() => handleDiscountTypeButtonClick("amount")}
                        >
                          Fixed Amount
                        </Button>
                        <Button
                          pressed={fields.exclusiveContent.value}
                          onClick={() => handleDiscountTypeButtonClick("exclusiveContent")}
                        >
                          Exclusive Content
                        </Button>
                      </ButtonGroup>
                      </Stack.Item>
                      {!fields.exclusiveContent.value && (
                        <Stack.Item fill>
                          <TextField
                            name="discount"
                            type="number"
                            {...fields.discount}
                            autoComplete="off"
                            suffix={
                              fields.discountType.value === "percentage"
                                ? "%"
                                : ""
                            }
                            fullWidth
                          />
                        </Stack.Item>
                      )}
                    </Stack>
                  </LegacyCard.Section>
                  <LegacyCard.Section title="XRP SEGMENT">
                    {/* <TextField
                      name="segment"
                      label="Segment"
                      type="text"
                      {...fields.segment}
                      autoComplete="off"
                    /> */}
                    <Stack distribution="fillEvenly">
                      <Stack.Item>
                        <TextField
                          name="issuer"
                          label="Issuer"
                          type="text"
                          {...fields.issuer}
                          autoComplete="off"
                        />
                      </Stack.Item>
                      <Stack.Item>
                        <TextField
                          name="taxon"
                          label="Taxon"
                          type="text"
                          {...fields.taxon}
                          autoComplete="off"
                        />
                      </Stack.Item>
                    </Stack>
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


