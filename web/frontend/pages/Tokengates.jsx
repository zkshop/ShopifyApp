import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Layout } from "@shopify/polaris";

import { TokengatesList } from "../components/TokengatesList";
import { getSubStatus } from "../services/AppInfo"


export default function Tokengates() {
  const navigate = useNavigate();

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);



  const checkSubscriptionStatus = async () => {
    try {
      const subStatus = await getSubStatus();
      console.log('subStatus: ', subStatus);
      if (subStatus.toLowerCase() !== 'active') {
        console.log('Navigate to pricing plans');
        navigate('/pricing');
      } else {
        console.log('Subscription is active');
      }
      setSubscriptionStatus(subStatus);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  checkSubscriptionStatus();

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
