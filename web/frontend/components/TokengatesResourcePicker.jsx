import { useCallback, useState } from "react";
import {
  Button,
  LegacyCard,
  Link,
  ResourceItem,
  ResourceList,
  Layout,
  Thumbnail,
} from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { CancelSmallMinor, ImageMajor } from "@shopify/polaris-icons";

export const TokengatesResourcePicker = ({ products }) => {
  const [isResourcePickerOpen, setIsResourcePickerOpen] = useState(false);
  const navigate = useNavigate();

  const handleTogglePicker = () => {
    setIsResourcePickerOpen(!isResourcePickerOpen);
  };

  const handleProductSelection = ({ selection }) => {
    handleTogglePicker();
    products.onChange(selection);
  };

  const handleNavigateToProduct = useCallback(
    (id) => {
      if (!id) return;
      navigate({
        name: "Product",
        resource: {
          id,
        },
      });
    },
    [navigate]
  );

  const handleRemoveItem = useCallback(
    (id) => {
      const filteredResources = products.value.filter(
        (product) => product.id !== id
      );
      products.onChange(filteredResources);
    },
    [products.value]
  );

  const listItemMarkup = (item) => {
    const { id, title, images } = item;

    const thumbnail = (
      <Thumbnail
        source={images?.[0]?.originalSrc || ImageMajor}
        alt={images?.[0]?.altText || title}
        size="small"
      />
    );

    return (
      <ResourceItem
        id={id}
        media={thumbnail}
        onClick={() => {}}
        verticalAlignment="center"
      >
        <Layout alignment="center">
          <Layout.Item fill>
            <p>
              <Link removeUnderline onClick={() => handleNavigateToProduct(id)}>
                {title}
              </Link>
            </p>
          </Layout.Item>
          <Button
            icon={CancelSmallMinor}
            plain
            accessibilityLabel="cancel"
            onClick={() => handleRemoveItem(id)}
          />
        </Layout>
      </ResourceItem>
    );
  };

  const selectedResourcesMarkup = () => {
    if (products.value.length > 0) {
      return (
        <ResourceList
          resourceName={{
            singular: "product",
            plural: "products",
          }}
          renderItem={listItemMarkup}
          items={products.value}
        />
      );
    }

    return (
      <LegacyCard.Section>
        <Layout distribution="center">
          <Button onClick={handleTogglePicker}>Choose products</Button>
        </Layout>
      </LegacyCard.Section>
    );
  };

  return (
    <LegacyCard
      title="Applies to"
      actions={
        products.value.length > 0
          ? [
              {
                content: "Choose products",
                onAction: () => setIsResourcePickerOpen(true),
              },
            ]
          : []
      }
    >
      <LegacyCard.Section>{selectedResourcesMarkup()}</LegacyCard.Section>

      <ResourcePicker
        resourceType="Product"
        open={isResourcePickerOpen}
        onCancel={handleTogglePicker}
        onSelection={handleProductSelection}
        showVariants={false}
        selectMultiple={true}
      />
    </LegacyCard>
  );
};
