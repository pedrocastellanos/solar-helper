export function recalculateSizing(current, updates = {}) {
    const next = { ...current, ...updates }
    const panelPowerW = Math.max(50, Number(next.panelPowerW) || 50)
    const panelWidthM = Math.max(0.3, Number(next.panelWidthM) || 0.3)
    const panelHeightM = Math.max(0.3, Number(next.panelHeightM) || 0.3)
    const panelArea = panelWidthM * panelHeightM
    const panelPowerKw = panelPowerW / 1000

    if (next.sizingMode === 'kwp') {
        const kwpTarget = Math.max(0.1, Number(next.kwp) || 0.1)
        const panelCount = Math.max(1, Math.ceil(kwpTarget / Math.max(0.001, panelPowerKw)))
        const kwp = Number((panelCount * panelPowerKw).toFixed(2))
        const area = Number((panelCount * panelArea).toFixed(2))
        return { ...next, panelPowerW, panelWidthM, panelHeightM, panelCount, kwp, area }
    }

    if (next.sizingMode === 'area') {
        const area = Math.max(0.3, Number(next.area) || 0.3)
        const panelCount = Math.max(1, Math.floor(area / Math.max(0.01, panelArea)))
        const kwp = Number((panelCount * panelPowerKw).toFixed(2))
        return { ...next, panelPowerW, panelWidthM, panelHeightM, panelCount, kwp, area }
    }

    const panelCount = Math.max(1, Number(next.panelCount) || 1)
    const kwp = Number(((panelCount * panelPowerW) / 1000).toFixed(2))
    const area = Number((panelCount * panelArea).toFixed(2))
    return { ...next, panelPowerW, panelWidthM, panelHeightM, panelCount, kwp, area }
}
