import { useCallback, useState } from "react";
import {
  Button,
  LegacyCard,
  ResourceItem,
  ResourceList,
  Thumbnail,
} from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";
import { CancelSmallMinor, ImageMajor } from "@shopify/polaris-icons";

export const TokengatesResourcePicker = ({ products }) => {
  const [isResourcePickerOpen, setIsResourcePickerOpen] = useState(false);

  const handleTogglePicker = () => {
    setIsResourcePickerOpen(!isResourcePickerOpen);
  };

  const handleProductSelection = ({ selection }) => {
    handleTogglePicker();
    products.onChange(selection);
  };

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
        <LegacyCard.Section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0 }}>
              {title}
            </p>
            <Button
              icon={CancelSmallMinor}
              plain
              accessibilityLabel="cancel"
              onClick={() => handleRemoveItem(id)}
            />
          </div>
        </LegacyCard.Section>
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
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={handleTogglePicker}>Choose products</Button>
        </div>
      </LegacyCard.Section>
    );
  };

  // change resource type to collection if needed
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
