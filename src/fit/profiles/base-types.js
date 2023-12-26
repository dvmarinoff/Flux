//
// Types
//
// as defined in table 1 of the fit protocol profiles.xmls
//
const BaseType = {
    enum:    0,   // 0x00
    sint8:   1,   // 0x01
    uint8:   2,   // 0x02
    sint16:  131, // 0x83
    uint16:  132, // 0x84
    sint32:  133, // 0x85
    uint32:  134, // 0x86
    string:  7,   // 0x07
    float32: 136, // 0x88
    float64: 137, // 0x89
    uint8z:  10,  // 0x0A
    uint16z: 139, // 0x8B
    uint32z: 140, // 0x8C
    byte:    13,  // 0x0D
    sint64:  142, // 0x8E
    uint64:  143, // 0x8F
    uint64z: 144, // 0x90
    '0':   'enum',
    '1':   'sint8',
    '2':   'uint8',
    '131': 'sint16',
    '132': 'uint16',
    '133': 'sint32',
    '134': 'uint32',
    '7':   'string',
    '136': 'float32',
    '137': 'float64',
    '10':  'uint8z',
    '139': 'uint16z',
    '140': 'uint32z',
    '13':  'byte',
    '142': 'sint64',
    '143': 'uint64',
    '144': 'uint64z',
};

const BaseTypeDefinitions = {
    'enum':    {name: 'enum',    base_type: BaseType.enum,    endian_ability: 0, size: 1, invalid_value: 0xFF},
    'sint8':   {name: 'sint8',   base_type: BaseType.sint8,   endian_ability: 0, size: 1, invalid_value: 0x7F},
    'uint8':   {name: 'uint8',   base_type: BaseType.uint8,   endian_ability: 0, size: 1, invalid_value: 0xFF},
    'sint16':  {name: 'sint16',  base_type: BaseType.sint16,  endian_ability: 1, size: 2, invalid_value: 0x7FFF},
    'uint16':  {name: 'uint16',  base_type: BaseType.uint16,  endian_ability: 1, size: 2, invalid_value: 0xFFFF},
    'sint32':  {name: 'sint32',  base_type: BaseType.sint32,  endian_ability: 1, size: 4, invalid_value: 0x7FFFFFFF},
    'uint32':  {name: 'uint32',  base_type: BaseType.uint32,  endian_ability: 1, size: 4, invalid_value: 0xFFFFFFFF},
    'string':  {name: 'string',  base_type: BaseType.string,  endian_ability: 0, size: 1, invalid_value: 0x00},
    'float32': {name: 'float32', base_type: BaseType.float32, endian_ability: 1, size: 4, invalid_value: 0xFFFFFFFF},
    'float64': {name: 'float64', base_type: BaseType.float64, endian_ability: 1, size: 8, invalid_value: 0xFFFFFFFFFFFFFFFF},
    'uint8z':  {name: 'uint8z',  base_type: BaseType.uint8z,  endian_ability: 0, size: 1, invalid_value: 0x00},
    'uint16z': {name: 'uint16z', base_type: BaseType.uint16z, endian_ability: 1, size: 2, invalid_value: 0x0000},
    'uint32z': {name: 'uint32z', base_type: BaseType.uint32z, endian_ability: 1, size: 4, invalid_value: 0x00000000},
    'byte':    {name: 'byte',    base_type: BaseType.byte,    endian_ability: 0, size: 1, invalid_value: 0xFF},
    'sint64':  {name: 'sint64',  base_type: BaseType.sint64,  endian_ability: 1, size: 8, invalid_value: 0x7FFFFFFFFFFFFFFF},
    'uint64':  {name: 'uint64',  base_type: BaseType.uint64,  endian_ability: 1, size: 8, invalid_value: 0xFFFFFFFFFFFFFFFF},
    'uint64z': {name: 'uint64z', base_type: BaseType.uint64z, endian_ability: 1, size: 8, invalid_value: 0x0000000000000000},
};

export {
    BaseType,
    BaseTypeDefinitions,
}

