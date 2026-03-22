export function buildStepResultsModel({ form, solar, apiPvcalc }) {
    const trackerAnnual = {
        fixed: apiPvcalc?.fixed ?? solar.trackerAnnual?.fixed ?? 0,
        oneAxis: apiPvcalc?.oneAxis ?? solar.trackerAnnual?.oneAxis ?? 0,
        twoAxis: apiPvcalc?.twoAxis ?? solar.trackerAnnual?.twoAxis ?? 0,
    }

    const monthlyByTracker = {
        fixed: apiPvcalc?.monthly?.fixed,
        oneAxis: apiPvcalc?.monthly?.oneAxis,
        twoAxis: apiPvcalc?.monthly?.twoAxis,
    }

    const selectedMonthlySeries =
        Array.isArray(monthlyByTracker[form.tracker]) && monthlyByTracker[form.tracker].length > 0
            ? monthlyByTracker[form.tracker]
            : solar.monthly

    const selectedMaxMonthlyValue = Math.max(...selectedMonthlySeries, 1)
    const fixedAnnual = trackerAnnual.fixed ?? 0
    const selectedAnnual = trackerAnnual[form.tracker] ?? 0
    const selectedDeltaKwh = Math.max(0, selectedAnnual - fixedAnnual)
    const selectedDeltaPct =
        form.tracker === 'fixed'
            ? 0
            : Math.round(((selectedAnnual / Math.max(1, fixedAnnual)) - 1) * 100)
    const selectedMonthlyAvg = selectedAnnual / 12
    const maxTrackerAnnual = Math.max(...Object.values(trackerAnnual), 1)

    return {
        trackerAnnual,
        selectedMonthlySeries,
        selectedMaxMonthlyValue,
        fixedAnnual,
        selectedAnnual,
        selectedDeltaKwh,
        selectedDeltaPct,
        selectedMonthlyAvg,
        maxTrackerAnnual,
    }
}
