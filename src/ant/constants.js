const ids = {
    // config
    setNetworkKey:     70, // 0x46
    unassignChannel:   65, // 0x41
    assignChannel:     66, // 0x42
    assignChannelExt:  66, // 0x42
    channelPeriod:     67, // 0x43
    channelFrequency:  69, // 0x45
    setChannelId:      81, // 0x51
    serialNumberSet:  101, // 0x65
    searchTimeout:     68, // 0x44
    searchLowTimeout:  99, // 0x63
    enableExtRx:      102, // 0x66
    libConfig:        110, // 0x6E

    // control
    resetSystem:       74, // 0x4A
    openChannel:       75, // 0x4B
    closeChannel:      76, // 0x4C
    requestMessage:    77, // 0x4D
    openRxScanMode:    91, // 0x5B
    sleepMessage:     197, // 0xC5

    // notification
    startUp:          111, // 0x6F
    serialError:      174, // 0xAE

    // data
    broadcastData:     78, // 0x4E
    acknowledgedData:  79, // 0x4F
    broascastExtData:  93, // 0x5D
    burstData:         80, // 0x50
    burstAdvData:     114, // 0x72

    // channel
    channelResponse:  64, // 0x40
    channelEvent:     64, // 0x40

    // requested response
    channelStatus:    82, // 0x52
    channelId:        81, // 0x51 response
    ANTVersion:       62, // 0x3E
    capabilities:     84, // 0x54
    serialNumber:     97  // 0x61
};

const events = {
    response_no_error:                0,
    event_rx_search_timeout:          1,
    event_rx_fail:                    2,
    event_tx:                         3,
    event_transfer_rx_failed:         4,
    event_transfer_tx_completed:      5,
    event_transfer_tx_failed:         6,
    event_channel_closed:             7,
    event_rx_fail_go_to_search:       8,
    event_channel_collision:          9,
    event_transfer_tx_start:         10,
    event_transfer_next_data_block:  11,
    channel_in_wrong_state:          21,
    channel_not_opened:              22,
    channel_id_not_set:              24,
    close_all_channels:              25,
    transfer_in_progress:            31,
    transfer_sequence_number_error:  32,
    transfer_in_error:               33,
    message_size_exceeds_limit:      39,
    invalid_message:                 40,
    invalid_network_number:          41,
    invalid_list_id:                 48,
    invalid_scan_tx_channel:         49,
    invalid_parameter_provided:      51,
    event_serial_que_overflow:       52,
    event_que_overflow:              53,
    encrypt_negotiation_success:     56,
    encrypt_negotiation_fail:        57,
    nvm_full_error:                  64,
    nvm_write_error:                 65,
    usb_string_write_fail:          112,
    mesg_serial_error_id:           174
};

const values = {
    sync: 164,
    libConfig: {
        disabled:       0,
        rxTimestamps:  32, // 0x20
        rssi:          64, // 0x40
        channelId:    128, // 0x80
    },
};

const channelTypes = {
    slave: {
        bidirectional:       0x00,
        sharedBidirectional: 0x20,
        receiveOnly:         0x40,
    },
    master: {
        bidirectional:       0x10,
        sharedBidirectional: 0x30,
    }
};

const keys = {
    antPlus: [0xB9, 0xA5, 0x21, 0xFB, 0xBD, 0x72, 0xC3, 0x45],
    public:  [0xE8, 0xE4, 0x21, 0x3B, 0x55, 0x7A, 0x67, 0xC1],
};

export { ids, events, values, channelTypes, keys };
