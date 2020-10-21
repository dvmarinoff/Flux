let workouts =
[
{ name: 'Maple (ramp)',
  type: 'Sweet Spot',
  description: '4 times 10 min Sweet Spot intervals with 5 min recovery in between and warm-up Ramp.',
  duration: 80,
  xml:
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
</workout_file>`
},
{ name: 'Maple',
  type: 'Sweet Spot',
  description: '4 times 10 min Sweet Spot intervals with 5 min recovery in between.',
  duration: 80,
  xml:
`<workout_file>
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
</workout_file>`
},
{ name: 'Pasta',
  type: 'Threshold',
  description: 'A Classic 2 times 20 min at almost FTP. Make sure you had some pasta before this session. You will need it!',
  duration: 70,
  xml:
`<workout_file>
    <author>Marinov</author>
    <name>2x20min 98%</name>
    <description>A Classic Threshold workout.</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="120" PowerLow="0.25" PowerHigh="0.39"/>
        <SteadyState Duration="60" Power="0.39"/>
        <SteadyState Duration="60" Power="0.47"/>
        <SteadyState Duration="60" Power="0.55"/>
        <SteadyState Duration="60" Power="0.63"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.98" OffPower="0.63"/>
        <SteadyState Duration="120" Power="0.5"/>
        <SteadyState Duration="1200" Power="0.98"/>
        <SteadyState Duration="600" Power="0.39"/>
        <SteadyState Duration="1200" Power="0.98"/>
        <SteadyState Duration="300" Power="0.39"/>
        <Cooldown Duration="300" PowerLow="0.39" PowerHigh="0.25"/>
    </workout>
</workout_file>`
},
{ name: 'Dijon',
  type: 'VO2 Max',
  description: '60/60s or 60 sec ON at 131% of FTP followed by 60 sec OFF. In 2 groups by 8 reps each.',
  duration: 57,
  xml:
`<workout_file>
    <author>Marinov</author>
    <name>60/60s 131%</name>
    <description></description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="120" PowerLow="0.25" PowerHigh="0.39"/>
        <SteadyState Duration="60" Power="0.39"/>
        <SteadyState Duration="60" Power="0.47"/>
        <SteadyState Duration="60" Power="0.55"/>
        <SteadyState Duration="60" Power="0.63"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.98" OffPower="0.63"/>
        <SteadyState Duration="120" Power="0.5"/>
        <IntervalsT Repeat="8" OnDuration="60" OffDuration="60" OnPower="1.31" OffPower="0.3"/>
        <SteadyState Duration="300" Power="0.39"/>
        <IntervalsT Repeat="8" OnDuration="60" OffDuration="60" OnPower="1.31" OffPower="0.3"/>
        <SteadyState Duration="300" Power="0.39"/>
        <Cooldown Duration="300" PowerLow="0.39" PowerHigh="0.25"/>
    </workout>
</workout_file>
`
},
{ name: 'Chili Pepper',
  type: 'VO2 Max',
  description: '40/20s or 40 sec ON at 121% of FTP followed by 20 sec OFF, in 2 groups by 10 reps each.',
  duration: 45,
  xml:
`<workout_file>
    <author>Marinov</author>
    <name>40/20s 121%</name>
    <description></description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="120" PowerLow="0.25" PowerHigh="0.39"/>
        <SteadyState Duration="60" Power="0.39"/>
        <SteadyState Duration="60" Power="0.47"/>
        <SteadyState Duration="60" Power="0.55"/>
        <SteadyState Duration="60" Power="0.63"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.98" OffPower="0.63"/>
        <SteadyState Duration="120" Power="0.5"/>
        <IntervalsT Repeat="10" OnDuration="40" OffDuration="20" OnPower="1.21" OffPower="0.3"/>
        <SteadyState Duration="300" Power="0.39"/>
        <IntervalsT Repeat="10" OnDuration="40" OffDuration="20" OnPower="1.21" OffPower="0.3"/>
        <SteadyState Duration="300" Power="0.39"/>
        <Cooldown Duration="300" PowerLow="0.39" PowerHigh="0.25"/>
    </workout>
</workout_file>
`
},
{ name: 'Chili Pepper +1',
  type: 'VO2 Max',
  description: 'Short but tough, this is the hardest workout ever. It\'s gonna burn!',
  duration: 45,
  xml:
`<workout_file>
    <author>Marinov</author>
    <name>40/20s 131%</name>
    <description></description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <Warmup Duration="120" PowerLow="0.25" PowerHigh="0.39"/>
        <SteadyState Duration="60" Power="0.39"/>
        <SteadyState Duration="60" Power="0.47"/>
        <SteadyState Duration="60" Power="0.55"/>
        <SteadyState Duration="60" Power="0.63"/>
        <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.98" OffPower="0.63"/>
        <SteadyState Duration="120" Power="0.5"/>
        <IntervalsT Repeat="10" OnDuration="40" OffDuration="20" OnPower="1.31" OffPower="0.3"/>
        <SteadyState Duration="300" Power="0.39"/>
        <IntervalsT Repeat="10" OnDuration="40" OffDuration="20" OnPower="1.31" OffPower="0.3"/>
        <SteadyState Duration="300" Power="0.39"/>
        <Cooldown Duration="300" PowerLow="0.39" PowerHigh="0.25"/>
    </workout>
</workout_file>
`},
{ name: 'Butter',
  type: 'Base',
  description: 'The bread and butter of Endurance training with efforts in Zone 1 and 2.',
  duration: 110,
  xml:
`<workout_file>
    <author>Marinov</author>
    <name>6x z1-2</name>
    <description>Enduarance workout in Zone 1 and 2.</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <FreeRide Duration="600" FlatRoad="1"/>
        <SteadyState Duration="600" Power="0.55"/>
        <SteadyState Duration="300" Power="0.51"/>
        <SteadyState Duration="600" Power="0.59"/>
        <SteadyState Duration="300" Power="0.51"/>
        <SteadyState Duration="600" Power="0.63"/>
        <SteadyState Duration="300" Power="0.51"/>
        <SteadyState Duration="600" Power="0.66"/>
        <SteadyState Duration="300" Power="0.51"/>
        <SteadyState Duration="600" Power="0.63"/>
        <SteadyState Duration="300" Power="0.51"/>
        <SteadyState Duration="600" Power="0.59"/>
        <SteadyState Duration="300" Power="0.51"/>
        <FreeRide Duration="600" FlatRoad="1"/>
    </workout>
</workout_file>`
},
{ name: 'Butter +1',
  type: 'Base',
  description: 'The bread and butter of Endurance training, with efforts in Zone 2.',
  duration: 110,
  xml:
`<workout_file>
    <author>Marinov</author>
    <name>6x z2</name>
    <description>Enduarance workout in Zone 2.</description>
    <sportType>bike</sportType>
    <tags>
    </tags>
    <workout>
        <FreeRide Duration="600" FlatRoad="1"/>
        <SteadyState Duration="600" Power="0.63"/>
        <SteadyState Duration="300" Power="0.55"/>
        <SteadyState Duration="600" Power="0.67"/>
        <SteadyState Duration="300" Power="0.55"/>
        <SteadyState Duration="600" Power="0.71"/>
        <SteadyState Duration="300" Power="0.55"/>
        <SteadyState Duration="600" Power="0.71"/>
        <SteadyState Duration="300" Power="0.55"/>
        <SteadyState Duration="600" Power="0.67"/>
        <SteadyState Duration="300" Power="0.55"/>
        <SteadyState Duration="600" Power="0.63"/>
        <SteadyState Duration="300" Power="0.55"/>
        <FreeRide Duration="600" FlatRoad="1"/>
    </workout>
</workout_file>`
},
];

export { workouts };
