import { useNavigate } from "react-router-dom";
import { Page, Layout } from "@shopify/polaris";

import { TokengatesList } from "../components/TokengatesList";

export default function Tokengates() {
  const navigate = useNavigate();

  return (
    <Page
      title="Tokengates"
      primaryAction={{
        content: "Create tokengate",
        onAction: () => {
          navigate("/createtokengate");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <TokengatesList />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
