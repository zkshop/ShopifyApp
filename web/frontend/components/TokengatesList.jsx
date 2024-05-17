import { useCallback } from "react";
import { Button, LegacyCard, IndexTable } from "@shopify/polaris";
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
    { title: "Network" },
    { title: "Details" },
    { title: "Products" },
    { title: "" },
  ];

  const indexTableRow = () => {
    if (!gatesData?.response) return;

    return gatesData.response.map((gate, index) => {
      const { id, name, requirements, subjectBindings } = gate;
      const requirementsValue = JSON.parse(requirements.value);

      const { network, issuer, taxon, contractAddress } = requirementsValue.conditions;
      const numProducts = subjectBindings?.nodes?.length ?? "—";

      return (
        <IndexTable.Row id={id} key={id} position={index}>
          <IndexTable.Cell>{name}</IndexTable.Cell>
          <IndexTable.Cell>{network}</IndexTable.Cell>
          <IndexTable.Cell>
            {network === 'XRP' ? (
              <>
                <div>
                  <span title="copy the issuer" style={{ cursor: "pointer" }}
                    onClick={() => navigator.clipboard.writeText(issuer)}>📋</span>
                  <span title={issuer} style={{ cursor: "default" }}> {issuer}</span>
                </div>
                <div>
                  <span title="copy the taxon" style={{ cursor: "pointer" }}
                    onClick={() => navigator.clipboard.writeText(taxon)}>📋</span>
                  <span title={taxon} style={{ cursor: "default" }}> {taxon}</span>
                </div>
              </>
            ) : (
              <div>
                <span title="copy the contract address" style={{ cursor: "pointer" }}
                  onClick={() => navigator.clipboard.writeText(contractAddress)}>📋</span>
                <span title={contractAddress} style={{ cursor: "default" }}> {contractAddress}</span>
              </div>
            )}
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <p>No Tokengates found</p>
    </div>
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
