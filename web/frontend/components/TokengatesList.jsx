import { useCallback } from "react";
import { Button, LegacyCard, IndexTable, Layout } from "@shopify/polaris";
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

  const tableHeadings = [
    { title: "Gate" },
    { title: "Issuer" },
    { title: "Taxon" },
    { title: "Products" },
    { title: "" },
  ];

  const indexTableRow = () => {
    if (!gatesData?.response) return;

    return gatesData.response.map((gate, index) => {
      const { id, name, requirements, reaction, subjectBindings } = gate;

      if (!requirements.value || !reaction.value) {
        return;
      }
      
      const requirementsValue = JSON.parse(requirements.value);

      const issuer = requirementsValue.conditions.issuer;
      const taxon = requirementsValue.conditions.taxon;

      const numProducts = subjectBindings?.nodes?.length ?? "—";

      return (
        <IndexTable.Row id={id} key={id} position={index}>
          <IndexTable.Cell>{name}</IndexTable.Cell>
          <IndexTable.Cell>
            <div>
              <span
                title="copy the issuer"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigator.clipboard.writeText(issuer);
                }}
                >
                📋
              </span>
              <span
                title={issuer}
                style={{ cursor: "default" }}
                > {issuer}
              </span>
            </div>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <div>
              <span
                title="copy the taxon"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  navigator.clipboard.writeText(taxon);
                }}
                >
                📋
              </span>
              <span
                title={taxon}
                style={{ cursor: "default" }}
                > {taxon}
              </span>
            </div>
          </IndexTable.Cell>
          <IndexTable.Cell>{numProducts}</IndexTable.Cell>
          <IndexTable.Cell>
            <Button onClick={() => deleteGate(id)}>Delete</Button>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    });
  };

  const emptyState = (
    <Layout distribution="center">
      <p>No Tokengates found</p>
    </Layout>
  );

  return (
    <LegacyCard>
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
    </LegacyCard>
  );
}
