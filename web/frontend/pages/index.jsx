import { Page, Layout, Card, TextContainer } from "@shopify/polaris";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export default function HomePage() {
  const navigate = useNavigate(); // Initialize navigate function

  // Function to handle navigation
  const goToTokengates = () => navigate('/tokengates');

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card title="Welcome to the Sorcel App" sectioned>
            <TextContainer>
              <p>
                This is your homepage, where we will guide you to make the most out of the app.
                <br/>
                You will find a detailed guide in the section below.
              </p>
            </TextContainer>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Set up guide" sectioned>
            <TextContainer>
              <p>
                Follow these instructions to set up the app:
                <ul>
                  <li>Under "Online Store" select "Themes"</li>
                  <li>Click on "Customize"</li>
                  <li>Click on "Home page" on the top banner</li>
                  <li>Select "Product"</li>
                  <li>Then select "Default product"</li>
                  <li>In the "Templates" section under "Products information" select "Add block"</li>
                  <li>Then select "Apps"</li>
                  <li>And select the Sorcel "Tokengate" block</li>
                </ul>
                Once it is done you can move the block freely in the "Products information" section.
              </p>
              <p>
                You can now create tokengates in the <span style={{color: 'blue', cursor: 'pointer'}} onClick={goToTokengates}>Tokengates</span> section of the app and they will appear in the selected products.
                <br/>
                To do so follow these instructions:
                <ul>
                  <li>Click on "Tokengates"</li>
                  <li>Click on "Create tokengate" on the top-right button</li>
                  <li>Fill in the form</li>
                  <li>Save the tokengate</li>
                </ul>
                You are done!  
              </p>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
