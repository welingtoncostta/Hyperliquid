async function fetchData() {
    const response = await fetch('http://localhost:8000/data');
    const data = await response.json();

    const vaultDataDiv = document.getElementById('vault-data');

    const vaultOrder = ["HLP", "Leader", "HLP Strategy A", "HLP Strategy B", "HLP Strategy Liquidator"];

    vaultOrder.forEach(vaultName => {
        const vault = data.find(v => v.name === vaultName);
        if (!vault) return;

        const vaultDiv = document.createElement('div');
        vaultDiv.classList.add('vault');
        vaultDiv.style.width = "80%";
        vaultDiv.style.width = "80%";

        const vaultNameDiv = document.createElement('h2');
        vaultNameDiv.textContent = vault.name;
        vaultDiv.appendChild(vaultNameDiv);

        const vaultAddressDiv = document.createElement('p');
        vaultAddressDiv.textContent = `Address: ${vault.address}`;
        vaultDiv.appendChild(vaultAddressDiv);

        const tvlDiv = document.createElement('p');
        tvlDiv.textContent = `TVL: ${vault.tvl}`;
        vaultDiv.appendChild(tvlDiv);

        if (vaultName === "HLP") {
            // For HLP, display total TVL
            let totalTvl = 0;
            data.forEach(v => {
                totalTvl += parseFloat(v.tvl);
            });
            const totalTvlDiv = document.createElement('p');
            totalTvlDiv.textContent = `TVL Total: ${totalTvl.toFixed(2)}`;
            vaultDiv.appendChild(totalTvlDiv);
        } else if (vaultName === "Leader") {
            // For Leader, display only name and TVL
        } else {
            // For other vaults, display TVL and "Ver Histórico" button
            const verHistoricoButton = document.createElement('button');
            verHistoricoButton.textContent = "Ver Histórico";
            vaultDiv.appendChild(verHistoricoButton);

            // Create trade history table
            const tradeHistoryTable = document.createElement('table');
            tradeHistoryTable.classList.add('trade-history-table');

            // Create table header
            const tableHeader = tradeHistoryTable.createTHead();
            const headerRow = tableHeader.insertRow();
            const headers = Object.keys(vault.trade_history[0] || {});
            headers.forEach(headerText => {
                const header = document.createElement("th");
                header.textContent = headerText;
                headerRow.appendChild(header);
            });

            // Create table body
            const tableBody = tradeHistoryTable.createTBody();
            vault.trade_history.forEach(trade => {
                const row = tableBody.insertRow();
                headers.forEach(headerText => {
                    const cell = row.insertCell();
                    cell.textContent = trade[headerText];
                });
            });

            vaultDiv.appendChild(tradeHistoryTable);

            tradeHistoryTable.style.display = 'none';

            verHistoricoButton.addEventListener('click', () => {
                if (tradeHistoryTable.style.display === 'none') {
                    tradeHistoryTable.style.display = 'table';
                } else {
                    tradeHistoryTable.style.display = 'none';
                }
            });
        }

        vaultDataDiv.appendChild(vaultDiv);
    });
}

fetchData();