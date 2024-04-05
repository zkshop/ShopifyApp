import { Page, Layout, Card, TextContainer, MediaCard } from "@shopify/polaris";

export default function HomePage() {

  return (
    <Page
      title="Welcome to the Sorcel App"
    >
      <Layout>
        <Layout.Section>
          <Card title="Get Started" sectioned>
            <TextContainer>
              <p>Welcome to your new Shopify app! This is your homepage, where you can guide new users through the onboarding process and explain the key features of your app.</p>
              <p>Feel free to customize this template to suit your app's needs.</p>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Next Steps" sectioned>
            <TextContainer>
              <p>Here are some suggestions on what to include in your onboarding process:</p>
              <ul>
                <li>Introduction to the app and its benefits</li>
                <li>Step-by-step guide on how to set up and use the app</li>
                <li>Support resources and how to get help</li>
              </ul>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <MediaCard
            title="Introduction Video"
            description="Watch this video to get a quick overview of the app."
            // Placeholder for video URL
            primaryAction={{
              content: 'Watch video',
              onAction: () => {}, // Placeholder for video action
            }}
            portrait={true}
          >
            {/* Placeholder for video component */}
          </MediaCard>
        </Layout.Section>
        <Layout.Section>
          <MediaCard
            title="Gallery"
            description="Explore the app through images."
            // Placeholder for images
            primaryAction={{
              content: 'View gallery',
              onAction: () => {}, // Placeholder for gallery action
            }}
          >
            {/* Placeholder for image gallery component */}
          </MediaCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
