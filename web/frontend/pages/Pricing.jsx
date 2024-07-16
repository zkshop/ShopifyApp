import React from 'react';
import { Page, Layout, Card, Button } from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';

const PricingPage = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const handleBilling = async () => {
    try {
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const jsonResponse = await response.json();

      console.log('response.confirmationUrl: ', jsonResponse);
      redirect.dispatch(Redirect.Action.REMOTE, jsonResponse.data);
    } catch (error) {
      console.error('Error creating billing:', error);
    }
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card title="Subscription Plan" sectioned>
            <div>
              <p><strong>Plan:</strong> Monthly Subscription</p>
              <p><strong>Price:</strong> $9.99 per month</p>
            </div>
            <Button primary onClick={handleBilling}>Buy Subscription</Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default PricingPage;
