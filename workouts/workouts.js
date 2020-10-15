let workouts =
{
    'zwo-test-ramp':
`<workout_file>
    <author>Marinov</author>
    <name>4x10 min Sweet Spot</name>
    <description>A Classic sweet spot workout.</description>
    <sportType>bike</sportType>
    <tags>
        <tag name="sweet"/>
        <tag name="spot"/>
    </tags>
    <workout>
        <Warmup Duration="300" PowerLow="0.25" PowerHigh="0.75"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.92" OffPower="0.39"/>
        <SteadyState Duration="180" Power="0.39"/>
        <IntervalsT Repeat="4" OnDuration="600" OffDuration="300" OnPower="0.92" OffPower="0.39"/>
        <Cooldown Duration="600" PowerLow="0.25" PowerHigh="0.47"/>
    </workout>
</workout_file>
`,
    'zwo-4x10min sweet spot':
` <workout_file>
    <author>Marinov</author>
    <name>4x10 min Sweet Spot</name>
    <description>A Classic sweet spot workout.</description>
    <sportType>bike</sportType>
    <workout>
        <SteadyState Duration="60" Power="0.30"/>
        <SteadyState Duration="60" Power="0.35"/>
        <SteadyState Duration="180" Power="0.39"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.92" OffPower="0.39"/>
        <SteadyState Duration="180" Power="0.39"/>
        <IntervalsT Repeat="4" OnDuration="600" OffDuration="300" OnPower="0.92" OffPower="0.39"/>
        <SteadyState Duration="600" Power="0.39"/>
    </workout>
</workout_file>
`
};

export { workouts };
