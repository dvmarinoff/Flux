let workouts =
[`<workout_file>
    <author>Marinov</author>
    <name>Dijon</name>
    <effort-type>VO2 Max</effort-type>
    <description>60/60s or 60 sec ON at 121% of FTP followed by 60 sec OFF. In 2 groups by 8 reps each.</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="120" PowerLow="0.32" PowerHigh="0.39"/>
        <SteadyState Duration="60" Power="0.39"/>
        <SteadyState Duration="60" Power="0.47"/>
        <SteadyState Duration="60" Power="0.55"/>
        <SteadyState Duration="60" Power="0.63"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.98" OffPower="0.63"/>
        <SteadyState Duration="120" Power="0.5"/>
        <IntervalsT Repeat="8" OnDuration="60" OffDuration="60" OnPower="1.21" OffPower="0.44" OffSlopeTarget="0"/>
        <SteadyState Duration="300" Power="0.40"/>
        <IntervalsT Repeat="8" OnDuration="60" OffDuration="60" OnPower="1.21" OffPower="0.44" OffSlopeTarget="0"/>
        <SteadyState Duration="300" Power="0.40"/>
        <Cooldown Duration="300" PowerLow="0.32" PowerHigh="0.39"/>
    </workout>
</workout_file>
`,
`<workout_file>
    <author>Marinov</author>
    <name>Chili Pepper</name>
    <effort-type>VO2 Max</effort-type>
    <description> NOTE: This is mixed mode workout with Slope targets in the main interval groups. 40/20s or 40 sec ON at 121% of FTP followed by 20 sec OFF, in 2 groups by 10 reps each.</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="120" PowerLow="0.32" PowerHigh="0.39"/>
        <SteadyState Duration="60" Power="0.39"/>
        <SteadyState Duration="60" Power="0.47"/>
        <SteadyState Duration="60" Power="0.55"/>
        <SteadyState Duration="60" Power="0.63"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.98" OffPower="0.63"/>
        <SteadyState Duration="120" Power="0.5"/>
        <IntervalsT Repeat="10" OnDuration="40" OffDuration="20" OnPower="1.21" OffPower="0.44" OnSlopeTarget="8" OffSlopeTarget="0"/>
        <SteadyState Duration="300" Power="0.40"/>
        <IntervalsT Repeat="10" OnDuration="40" OffDuration="20" OnPower="1.21" OffPower="0.44" OnSlopeTarget="8" OffSlopeTarget="0"/>
        <SteadyState Duration="300" Power="0.40"/>
        <Cooldown Duration="300" PowerLow="0.32" PowerHigh="0.39" />
    </workout>
</workout_file>
`,
`<workout_file>
    <author>Marinov</author>
    <name>Chili Pepper +1</name>
    <effort-type>VO2 Max</effort-type>
    <description>Short but tough, this is the hardest workout ever. It\'s gonna burn!</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="120" PowerLow="0.32" PowerHigh="0.39"/>
        <SteadyState Duration="60" Power="0.39"/>
        <SteadyState Duration="60" Power="0.47"/>
        <SteadyState Duration="60" Power="0.55"/>
        <SteadyState Duration="60" Power="0.63"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.98" OffPower="0.63"/>
        <SteadyState Duration="120" Power="0.5"/>
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <FreeRide Duration="300" SlopeTarget="3.5" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="40" Power="1.31"/>
        <FreeRide Duration="20" />
        <SteadyState Duration="300" Power="0.39"/>
        <Cooldown Duration="300" PowerLow="0.32" PowerHigh="0.39"/>
    </workout>
</workout_file>
`,
`<workout_file>
    <author>Marinov</author>
    <name>Pasta</name>
    <effort-type>Threshold</effort-type>
    <description>A Classic 2 times 20 min at almost FTP. Make sure you had some pasta before this session. You will need it!</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="120" PowerLow="0.32" PowerHigh="0.39"/>
        <SteadyState Duration="60" Power="0.39"/>
        <SteadyState Duration="60" Power="0.47"/>
        <SteadyState Duration="60" Power="0.55"/>
        <SteadyState Duration="60" Power="0.63"/>
        <IntervalsT  Repeat="2" OnDuration="30" OffDuration="30" OnPower="1.06" OffPower="0.63"/>
        <SteadyState Duration="120" Power="0.5"/>
        <SteadyState Duration="1200" Power="0.98"/>
        <SteadyState Duration="600" Power="0.44"/>
        <SteadyState Duration="1200" Power="0.98"/>
        <SteadyState Duration="300" Power="0.44"/>
        <Cooldown Duration="300" PowerLow="0.32" PowerHigh="0.44"/>
    </workout>
</workout_file>`
,
`<workout_file>
    <author>Marinov</author>
    <name>Potato Chips</name>
    <effort-type>Threshold</effort-type>
    <description>5 by 5 min at 100% of FTP with 5 min recovery in between. Perfect to get you accustome to first intensite sessions after a base block, or just that new FTP value.</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <SteadyState Duration="300" Power="0.39"/>
        <SteadyState Duration="120" Power="0.60"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.98" OffPower="0.5"/>
        <SteadyState Duration="120" Power="0.56"/>
        <IntervalsT Repeat="5" OnDuration="300" OffDuration="300" OnPower="1" OffPower="0.5"/>
        <SteadyState Duration="300" Power="0.39"/>
    </workout>
</workout_file>`
,
`<workout_file>
    <author>Marinov</author>
    <name>Maple</name>
    <effort-type>Sweet Spot</effort-type>
    <description>4 times 10 min Sweet Spot intervals with 5 min recovery in between and warm-up Ramp.</description>
    <sportType>bike</sportType>
    <tags>
        <tag name="sweet"/>
        <tag name="spot"/>
    </tags>
    <workout>
        <Warmup Duration="300" PowerLow="0.32" PowerHigh="0.75"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="1.08" OffPower="0.44"/>
        <SteadyState Duration="180" Power="0.44"/>
        <IntervalsT Repeat="4" OnDuration="600" OffDuration="300" OnPower="0.92" OffPower="0.44"/>
        <Cooldown Duration="600" PowerLow="0.32" PowerHigh="0.44"/>
    </workout>
</workout_file>`
,
`<workout_file>
    <author>Marinov</author>
    <name>Honey</name>
    <effort-type>Sweet Spot</effort-type>
    <description>4 times 10 min Sweet Spot intervals with 5 min recovery in between.</description>
    <sportType>bike</sportType>
    <workout>
        <Warmup Duration="300" PowerLow="0.32" PowerHigh="0.75"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="1.08" OffPower="0.44"/>
        <SteadyState Duration="180" Power="0.44"/>
        <IntervalsT Repeat="3" OnDuration="900" OffDuration="300" OnPower="0.90" OffPower="0.44"/>
        <Cooldown Duration="600" PowerLow="0.32" PowerHigh="0.44"/>
    </workout>
</workout_file>`
,
`<workout_file>
    <author>Marinov</author>
    <name>Baguette</name>
    <effort-type>Base</effort-type>
    <description>The bread and butter of Endurance training with efforts in Zone 1 and 2.</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="600" PowerLow="0.32" PowerHigh="0.63"/>
        <SteadyState Duration="600" Power="0.63"/>
        <SteadyState Duration="300" Power="0.56"/>
        <SteadyState Duration="600" Power="0.71"/>
        <SteadyState Duration="300" Power="0.56"/>
        <SteadyState Duration="600" Power="0.71"/>
        <SteadyState Duration="300" Power="0.56"/>
        <SteadyState Duration="600" Power="0.71"/>
        <SteadyState Duration="300" Power="0.56"/>
        <SteadyState Duration="600" Power="0.63"/>
        <Cooldown Duration="600" PowerLow="0.32" PowerHigh="0.63"/>
    </workout>
</workout_file>`
,
`<workout_file>
    <author>Marinov</author>
    <name>Baguette +1</name>
    <effort-type>Base</effort-type>
    <description>The bread and butter of Endurance training, with efforts in Zone 2.</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <SteadyState Duration="600" Power="0.39"/>
        <SteadyState Duration="600" Power="0.63"/>
        <SteadyState Duration="300" Power="0.56"/>
        <SteadyState Duration="600" Power="0.67"/>
        <SteadyState Duration="300" Power="0.56"/>
        <SteadyState Duration="600" Power="0.71"/>
        <SteadyState Duration="300" Power="0.56"/>
        <SteadyState Duration="600" Power="0.71"/>
        <SteadyState Duration="300" Power="0.56"/>
        <SteadyState Duration="600" Power="0.71"/>
        <SteadyState Duration="300" Power="0.56"/>
        <SteadyState Duration="600" Power="0.67"/>
        <SteadyState Duration="300" Power="0.56"/>
        <SteadyState Duration="600" Power="0.63"/>
        <SteadyState Duration="600" Power="0.39"/>
    </workout>
</workout_file>`
,
`<workout_file>
    <author>Marinov</author>
    <name>Butter+1</name>
    <effort-type>Base</effort-type>
    <description>The bread and butter of Endurance training, in steady Zone 2 at 67% of FTP.</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="360" PowerLow="0.32" PowerHigh="0.55"/>
        <IntervalsT Repeat="2" OnDuration="60" OffDuration="60" OnPower="0.88" OffPower="0.55"/>
        <SteadyState Duration="6000" Power="0.67"/>
        <Cooldown Duration="600" PowerLow="0.32" PowerHigh="0.67"/>
    </workout>
</workout_file>`
,
`<workout_file>
    <author>Marinov</author>
    <name>Butter+1</name>
    <effort-type>Base</effort-type>
    <description>The bread and butter of Endurance training, in steady Zone 2 at 67% of FTP.</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="360" PowerLow="0.32" PowerHigh="0.55"/>
        <IntervalsT Repeat="2" OnDuration="60" OffDuration="60" OnPower="0.88" OffPower="0.55"/>
        <SteadyState Duration="4200" Power="0.67"/>
        <Cooldown Duration="600" PowerLow="0.32" PowerHigh="0.67"/>
    </workout>
</workout_file>`
,
`<workout_file>
    <author>Marinov</author>
    <name>Blackcurrant</name>
    <effort-type>Recovery</effort-type>
    <description>A recovery ride in zone 1 at 50% of FTP.</description>
    <sporttype>bike</sporttype>
    <tags></tags>
    <workout>
        <Warmup Duration="600" PowerLow="0.30" PowerHigh="0.5"/>
        <SteadyState Duration="2400" Power="0.5"/>
        <Cooldown Duration="600" PowerLow="0.30" PowerHigh="0.5"/>
    </workout>
</workout_file>`

];

export { workouts };
