import { useCallback } from "react";
import { Button, Card, IndexTable, Stack } from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function TokengatesList() {
  const fetch = useAuthenticatedFetch();

  const { data: gatesData, refetch: refetchGates } = useAppQuery({
    url: "/api/gates",
    reactQueryOptions: {
      onSuccess: () => {},
    },
  });

  const deleteGate = useCallback(
    async (id) => {
      const response = await fetch(`/api/gates/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Error deleting gate");
        return;
      }

      refetchGates();
    },
    [fetch, refetchGates]
  );

  const perkTypeName = Object.freeze({
    discount: "Discount",
    exclusive: "Exclusive",
  });

  const tableHeadings = [
    { title: "Gate" },
    { title: "Perk" },
    { title: "Segment" },
    { title: "Issuer" },
    { title: "Taxon" },
    { title: "Products" },
    { title: "" },
  ];

  const indexTableRow = () => {
    if (!gatesData?.response) return;

    return gatesData.response.map((gate, index) => {
      const { id, name, requirements, reaction, subjectBindings } = gate;

      if (!requirements?.value || !reaction?.value) return;


      //segment and issuer cut but either hover to see full or icon to copy
      const segmentConditions = JSON.parse(requirements.value)?.conditions || [];
      const segment = segmentConditions
        .map((condition) => {
          const contractAddress = condition.contractAddress;
          return contractAddress.length > 20 ? `${contractAddress.substring(0, 10)}...${contractAddress.substring(contractAddress.length - 10)}` : contractAddress;
        })
        .join(", ");
      const issuer = segmentConditions
        .map((condition) => {
          const issuerContract = condition.issuer;
          return issuerContract.length > 10 ? `${issuerContract.substring(0, 6)}...${issuerContract.substring(issuerContract.length - 5)}` : issuerContract;
        })
        .join(", ");
      const taxon = segmentConditions.map((condition) => condition.taxon).join(", ");

      const perkType = JSON.parse(reaction.value)?.type ?? "—";

      const numProducts = subjectBindings?.nodes?.length ?? "—";

      return (
        <IndexTable.Row id={id} key={id} position={index}>
          <IndexTable.Cell>{name}</IndexTable.Cell>
          <IndexTable.Cell>{perkTypeName[`${perkType}`]}</IndexTable.Cell>
          <IndexTable.Cell>{segment}</IndexTable.Cell>
          <IndexTable.Cell>{issuer}</IndexTable.Cell>
          <IndexTable.Cell>{taxon}</IndexTable.Cell>
          <IndexTable.Cell>{numProducts}</IndexTable.Cell>
          <IndexTable.Cell>
            <Button onClick={() => deleteGate(id)}>Delete</Button>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    });
  };

  const emptyState = (
    <Stack distribution="center">
      <p>No Tokengates found</p>
    </Stack>
  );

  return (
    <Card>
      <IndexTable
        emptyState={emptyState}
        headings={tableHeadings}
        itemCount={gatesData?.response?.length ?? 0}
        resourceName={{
          singular: "Tokengate",
          plural: "Tokengates",
        }}
        selectable={false}
      >
        {indexTableRow()}
      </IndexTable>
    </Card>
  );
}
