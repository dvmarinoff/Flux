export default {
    "file_id": {
        "fields": {
            "type": 0,
            "manufacturer": 1,
            "product": 2,
            "serial_number": 3,
            "time_created": 4,
            "number": 5,
            "product_name": 8
        }
    },
    "file_creator": {
        "fields": {
            "software_version": 0,
            "hardware_version": 1
        }
    },
    "timestamp_correlation": {
        "fields": {
            "timestamp": 253,
            "fractional_timestamp": 0,
            "system_timestamp": 1,
            "fractional_system_timestamp": 2,
            "local_timestamp": 3,
            "timestamp_ms": 4,
            "system_timestamp_ms": 5
        }
    },
    "activity": {
        "fields": {
            "timestamp": 253,
            "total_timer_time": 0,
            "num_sessions": 1,
            "type": 2,
            "event": 3,
            "event_type": 4,
            "local_timestamp": 5,
            "event_group": 6
        }
    },
    "session": {
        "fields": {
            "message_index": 254,
            "timestamp": 253,
            "event": 0,
            "event_type": 1,
            "start_time": 2,
            "start_position_lat": 3,
            "start_position_long": 4,
            "sport": 5,
            "sub_sport": 6,
            "total_elapsed_time": 7,
            "total_timer_time": 8,
            "total_distance": 9,
            "total_cycles": 10,
            "total_calories": 11,
            "total_fat_calories": 13,
            "avg_speed": 14,
            "max_speed": 15,
            "avg_heart_rate": 16,
            "max_heart_rate": 17,
            "avg_cadence": 18,
            "max_cadence": 19,
            "avg_power": 20,
            "max_power": 21,
            "total_ascent": 22,
            "total_descent": 23,
            "total_training_effect": 24,
            "first_lap_index": 25,
            "num_laps": 26,
            "event_group": 27,
            "trigger": 28,
            "nec_lat": 29,
            "nec_long": 30,
            "swc_lat": 31,
            "swc_long": 32,
            "num_lengths": 33,
            "normalized_power": 34,
            "training_stress_score": 35,
            "intensity_factor": 36,
            "left_right_balance": 37,
            "avg_stroke_count": 41,
            "avg_stroke_distance": 42,
            "swim_stroke": 43,
            "pool_length": 44,
            "threshold_power": 45,
            "pool_length_unit": 46,
            "num_active_lengths": 47,
            "total_work": 48,
            "avg_altitude": 49,
            "max_altitude": 50,
            "gps_accuracy": 51,
            "avg_grade": 52,
            "avg_pos_grade": 53,
            "avg_neg_grade": 54,
            "max_pos_grade": 55,
            "max_neg_grade": 56,
            "avg_temperature": 57,
            "max_temperature": 58,
            "total_moving_time": 59,
            "avg_pos_vertical_speed": 60,
            "avg_neg_vertical_speed": 61,
            "max_pos_vertical_speed": 62,
            "max_neg_vertical_speed": 63,
            "min_heart_rate": 64,
            "time_in_hr_zone": 65,
            "time_in_speed_zone": 66,
            "time_in_cadence_zone": 67,
            "time_in_power_zone": 68,
            "avg_lap_time": 69,
            "best_lap_index": 70,
            "min_altitude": 71,
            "player_score": 82,
            "opponent_score": 83,
            "opponent_name": 84,
            "stroke_count": 85,
            "zone_count": 86,
            "max_ball_speed": 87,
            "avg_ball_speed": 88,
            "avg_vertical_oscillation": 89,
            "avg_stance_time_percent": 90,
            "avg_stance_time": 91,
            "avg_fractional_cadence": 92,
            "max_fractional_cadence": 93,
            "total_fractional_cycles": 94,
            "avg_total_hemoglobin_conc": 95,
            "min_total_hemoglobin_conc": 96,
            "max_total_hemoglobin_conc": 97,
            "avg_saturated_hemoglobin_percent": 98,
            "min_saturated_hemoglobin_percent": 99,
            "max_saturated_hemoglobin_percent": 100,
            "avg_left_torque_effectiveness": 101,
            "avg_right_torque_effectiveness": 102,
            "avg_left_pedal_smoothness": 103,
            "avg_right_pedal_smoothness": 104,
            "avg_combined_pedal_smoothness": 105,
            "sport_index": 111,
            "time_standing": 112,
            "stand_count": 113,
            "avg_left_pco": 114,
            "avg_right_pco": 115,
            "avg_left_power_phase": 116,
            "avg_left_power_phase_peak": 117,
            "avg_right_power_phase": 118,
            "avg_right_power_phase_peak": 119,
            "avg_power_position": 120,
            "max_power_position": 121,
            "avg_cadence_position": 122,
            "max_cadence_position": 123,
            "enhanced_avg_speed": 124,
            "enhanced_max_speed": 125,
            "enhanced_avg_altitude": 126,
            "enhanced_min_altitude": 127,
            "enhanced_max_altitude": 128,
            "avg_lev_motor_power": 129,
            "max_lev_motor_power": 130,
            "lev_battery_consumption": 131,
            "avg_vertical_ratio": 132,
            "avg_stance_time_balance": 133,
            "avg_step_length": 134,
            "total_anaerobic_training_effect": 137,
            "avg_vam": 139,
            "total_grit": 181,
            "total_flow": 182,
            "jump_count": 183,
            "avg_grit": 186,
            "avg_flow": 187,
            "total_fractional_ascent": 199,
            "total_fractional_descent": 200,
            "avg_core_temperature": 208,
            "min_core_temperature": 209,
            "max_core_temperature": 210
        }
    },
    "lap": {
        "fields": {
            "message_index": 254,
            "timestamp": 253,
            "event": 0,
            "event_type": 1,
            "start_time": 2,
            "start_position_lat": 3,
            "start_position_long": 4,
            "end_position_lat": 5,
            "end_position_long": 6,
            "total_elapsed_time": 7,
            "total_timer_time": 8,
            "total_distance": 9,
            "total_cycles": 10,
            "total_calories": 11,
            "total_fat_calories": 12,
            "avg_speed": 13,
            "max_speed": 14,
            "avg_heart_rate": 15,
            "max_heart_rate": 16,
            "avg_cadence": 17,
            "max_cadence": 18,
            "avg_power": 19,
            "max_power": 20,
            "total_ascent": 21,
            "total_descent": 22,
            "intensity": 23,
            "lap_trigger": 24,
            "sport": 25,
            "event_group": 26,
            "num_lengths": 32,
            "normalized_power": 33,
            "left_right_balance": 34,
            "first_length_index": 35,
            "avg_stroke_distance": 37,
            "swim_stroke": 38,
            "sub_sport": 39,
            "num_active_lengths": 40,
            "total_work": 41,
            "avg_altitude": 42,
            "max_altitude": 43,
            "gps_accuracy": 44,
            "avg_grade": 45,
            "avg_pos_grade": 46,
            "avg_neg_grade": 47,
            "max_pos_grade": 48,
            "max_neg_grade": 49,
            "avg_temperature": 50,
            "max_temperature": 51,
            "total_moving_time": 52,
            "avg_pos_vertical_speed": 53,
            "avg_neg_vertical_speed": 54,
            "max_pos_vertical_speed": 55,
            "max_neg_vertical_speed": 56,
            "time_in_hr_zone": 57,
            "time_in_speed_zone": 58,
            "time_in_cadence_zone": 59,
            "time_in_power_zone": 60,
            "repetition_num": 61,
            "min_altitude": 62,
            "min_heart_rate": 63,
            "wkt_step_index": 71,
            "opponent_score": 74,
            "stroke_count": 75,
            "zone_count": 76,
            "avg_vertical_oscillation": 77,
            "avg_stance_time_percent": 78,
            "avg_stance_time": 79,
            "avg_fractional_cadence": 80,
            "max_fractional_cadence": 81,
            "total_fractional_cycles": 82,
            "player_score": 83,
            "avg_total_hemoglobin_conc": 84,
            "min_total_hemoglobin_conc": 85,
            "max_total_hemoglobin_conc": 86,
            "avg_saturated_hemoglobin_percent": 87,
            "min_saturated_hemoglobin_percent": 88,
            "max_saturated_hemoglobin_percent": 89,
            "avg_left_torque_effectiveness": 91,
            "avg_right_torque_effectiveness": 92,
            "avg_left_pedal_smoothness": 93,
            "avg_right_pedal_smoothness": 94,
            "avg_combined_pedal_smoothness": 95,
            "time_standing": 98,
            "stand_count": 99,
            "avg_left_pco": 100,
            "avg_right_pco": 101,
            "avg_left_power_phase": 102,
            "avg_left_power_phase_peak": 103,
            "avg_right_power_phase": 104,
            "avg_right_power_phase_peak": 105,
            "avg_power_position": 106,
            "max_power_position": 107,
            "avg_cadence_position": 108,
            "max_cadence_position": 109,
            "enhanced_avg_speed": 110,
            "enhanced_max_speed": 111,
            "enhanced_avg_altitude": 112,
            "enhanced_min_altitude": 113,
            "enhanced_max_altitude": 114,
            "avg_lev_motor_power": 115,
            "max_lev_motor_power": 116,
            "lev_battery_consumption": 117,
            "avg_vertical_ratio": 118,
            "avg_stance_time_balance": 119,
            "avg_step_length": 120,
            "avg_vam": 121,
            "total_grit": 149,
            "total_flow": 150,
            "jump_count": 151,
            "avg_grit": 153,
            "avg_flow": 154,
            "total_fractional_ascent": 156,
            "total_fractional_descent": 157,
            "avg_core_temperature": 158,
            "min_core_temperature": 159,
            "max_core_temperature": 160
        }
    },
    "length": {
        "fields": {
            "message_index": 254,
            "timestamp": 253,
            "event": 0,
            "event_type": 1,
            "start_time": 2,
            "total_elapsed_time": 3,
            "total_timer_time": 4,
            "total_strokes": 5,
            "avg_speed": 6,
            "swim_stroke": 7,
            "avg_swimming_cadence": 9,
            "event_group": 10,
            "total_calories": 11,
            "length_type": 12,
            "player_score": 18,
            "opponent_score": 19,
            "stroke_count": 20,
            "zone_count": 21
        }
    },
    "record": {
        "fields": {
            "timestamp": 253,
            "position_lat": 0,
            "position_long": 1,
            "altitude": 2,
            "heart_rate": 3,
            "cadence": 4,
            "distance": 5,
            "speed": 6,
            "power": 7,
            "compressed_speed_distance": 8,
            "grade": 9,
            "resistance": 10,
            "time_from_course": 11,
            "cycle_length": 12,
            "temperature": 13,
            "speed_1s": 17,
            "cycles": 18,
            "total_cycles": 19,
            "compressed_accumulated_power": 28,
            "accumulated_power": 29,
            "left_right_balance": 30,
            "gps_accuracy": 31,
            "vertical_speed": 32,
            "calories": 33,
            "vertical_oscillation": 39,
            "stance_time_percent": 40,
            "stance_time": 41,
            "activity_type": 42,
            "left_torque_effectiveness": 43,
            "right_torque_effectiveness": 44,
            "left_pedal_smoothness": 45,
            "right_pedal_smoothness": 46,
            "combined_pedal_smoothness": 47,
            "time128": 48,
            "stroke_type": 49,
            "zone": 50,
            "ball_speed": 51,
            "cadence256": 52,
            "fractional_cadence": 53,
            "total_hemoglobin_conc": 54,
            "total_hemoglobin_conc_min": 55,
            "total_hemoglobin_conc_max": 56,
            "saturated_hemoglobin_percent": 57,
            "saturated_hemoglobin_percent_min": 58,
            "saturated_hemoglobin_percent_max": 59,
            "device_index": 62,
            "left_pco": 67,
            "right_pco": 68,
            "left_power_phase": 69,
            "left_power_phase_peak": 70,
            "right_power_phase": 71,
            "right_power_phase_peak": 72,
            "enhanced_speed": 73,
            "enhanced_altitude": 78,
            "battery_soc": 81,
            "motor_power": 82,
            "vertical_ratio": 83,
            "stance_time_balance": 84,
            "step_length": 85,
            "absolute_pressure": 91,
            "depth": 92,
            "next_stop_depth": 93,
            "next_stop_time": 94,
            "time_to_surface": 95,
            "ndl_time": 96,
            "cns_load": 97,
            "n2_load": 98,
            "grit": 114,
            "flow": 115,
            "ebike_travel_range": 117,
            "ebike_battery_level": 118,
            "ebike_assist_mode": 119,
            "ebike_assist_level_percent": 120,
            "core_temperature": 139
        }
    },
    "event": {
        "fields": {
            "timestamp": 253,
            "event": 0,
            "event_type": 1,
            "data16": 2,
            "data": 3,
            "event_group": 4,
            "score": 7,
            "opponent_score": 8,
            "front_gear_num": 9,
            "front_gear": 10,
            "rear_gear_num": 11,
            "rear_gear": 12,
            "device_index": 13,
            "radar_threat_level_max": 21,
            "radar_threat_count": 22
        }
    },
    "device_info": {
        "fields": {
            "timestamp": 253,
            "device_index": 0,
            "device_type": 1,
            "manufacturer": 2,
            "serial_number": 3,
            "product": 4,
            "software_version": 5,
            "hardware_version": 6,
            "cum_operating_time": 7,
            "battery_voltage": 10,
            "battery_status": 11,
            "sensor_position": 18,
            "descriptor": 19,
            "ant_transmission_type": 20,
            "ant_device_number": 21,
            "ant_network": 22,
            "source_type": 25,
            "product_name": 27
        }
    },
    "training_file": {
        "fields": {
            "timestamp": 253,
            "type": 0,
            "manufacturer": 1,
            "product": 2,
            "serial_number": 3,
            "time_created": 4
        }
    },
    "hrv": {
        "fields": {
            "time": 0
        }
    },
    "weather_conditions": {
        "fields": {
            "timestamp": 253,
            "weather_report": 0,
            "temperature": 1,
            "condition": 2,
            "wind_direction": 3,
            "wind_speed": 4,
            "precipitation_probability": 5,
            "temperature_feels_like": 6,
            "relative_humidity": 7,
            "location": 8,
            "observed_at_time": 9,
            "observed_location_lat": 10,
            "observed_location_long": 11,
            "day_of_week": 12,
            "high_temperature": 13,
            "low_temperature": 14
        }
    },
    "weather_alert": {
        "fields": {
            "timestamp": 253,
            "report_id": 0,
            "issue_time": 1,
            "expire_time": 2,
            "severity": 3,
            "type": 4
        }
    },
    "gps_metadata": {
        "fields": {
            "timestamp": 253,
            "timestamp_ms": 0,
            "position_lat": 1,
            "position_long": 2,
            "enhanced_altitude": 3,
            "enhanced_speed": 4,
            "heading": 5,
            "utc_timestamp": 6,
            "velocity": 7
        }
    },
    "camera_event": {
        "fields": {
            "timestamp": 253,
            "timestamp_ms": 0,
            "camera_event_type": 1,
            "camera_file_uuid": 2,
            "camera_orientation": 3
        }
    },
    "gyroscope_data": {
        "fields": {
            "timestamp": 253,
            "timestamp_ms": 0,
            "sample_time_offset": 1,
            "gyro_x": 2,
            "gyro_y": 3,
            "gyro_z": 4,
            "calibrated_gyro_x": 5,
            "calibrated_gyro_y": 6,
            "calibrated_gyro_z": 7
        }
    },
    "accelerometer_data": {
        "fields": {
            "timestamp": 253,
            "timestamp_ms": 0,
            "sample_time_offset": 1,
            "accel_x": 2,
            "accel_y": 3,
            "accel_z": 4,
            "calibrated_accel_x": 5,
            "calibrated_accel_y": 6,
            "calibrated_accel_z": 7,
            "compressed_calibrated_accel_x": 8,
            "compressed_calibrated_accel_y": 9,
            "compressed_calibrated_accel_z": 10
        }
    },
    "magnetometer_data": {
        "fields": {
            "timestamp": 253,
            "timestamp_ms": 0,
            "sample_time_offset": 1,
            "mag_x": 2,
            "mag_y": 3,
            "mag_z": 4,
            "calibrated_mag_x": 5,
            "calibrated_mag_y": 6,
            "calibrated_mag_z": 7
        }
    },
    "barometer_data": {
        "fields": {
            "timestamp": 253,
            "timestamp_ms": 0,
            "sample_time_offset": 1,
            "baro_pres": 2
        }
    },
    "three_d_sensor_calibration": {
        "fields": {
            "timestamp": 253,
            "sensor_type": 0,
            "calibration_factor": 1,
            "calibration_divisor": 2,
            "level_shift": 3,
            "offset_cal": 4,
            "orientation_matrix": 5
        }
    },
    "one_d_sensor_calibration": {
        "fields": {
            "timestamp": 253,
            "sensor_type": 0,
            "calibration_factor": 1,
            "calibration_divisor": 2,
            "level_shift": 3,
            "offset_cal": 4
        }
    },
    "video_frame": {
        "fields": {
            "timestamp": 253,
            "timestamp_ms": 0,
            "frame_number": 1
        }
    },
    "obdii_data": {
        "fields": {
            "timestamp": 253,
            "timestamp_ms": 0,
            "time_offset": 1,
            "pid": 2,
            "raw_data": 3,
            "pid_data_size": 4,
            "system_time": 5,
            "start_timestamp": 6,
            "start_timestamp_ms": 7
        }
    },
    "nmea_sentence": {
        "fields": {
            "timestamp": 253,
            "timestamp_ms": 0,
            "sentence": 1
        }
    },
    "aviation_attitude": {
        "fields": {
            "timestamp": 253,
            "timestamp_ms": 0,
            "system_time": 1,
            "pitch": 2,
            "roll": 3,
            "accel_lateral": 4,
            "accel_normal": 5,
            "turn_rate": 6,
            "stage": 7,
            "attitude_stage_complete": 8,
            "track": 9,
            "validity": 10
        }
    },
    "video": {
        "fields": {
            "url": 0,
            "hosting_provider": 1,
            "duration": 2
        }
    },
    "video_title": {
        "fields": {
            "message_index": 254,
            "message_count": 0,
            "text": 1
        }
    },
    "video_description": {
        "fields": {
            "message_index": 254,
            "message_count": 0,
            "text": 1
        }
    },
    "video_clip": {
        "fields": {
            "clip_number": 0,
            "start_timestamp": 1,
            "start_timestamp_ms": 2,
            "end_timestamp": 3,
            "end_timestamp_ms": 4,
            "clip_start": 6,
            "clip_end": 7
        }
    },
    "set": {
        "fields": {
            "timestamp": 254,
            "duration": 0,
            "repetitions": 3,
            "weight": 4,
            "set_type": 5,
            "start_time": 6,
            "category": 7,
            "category_subtype": 8,
            "weight_display_unit": 9,
            "message_index": 10,
            "wkt_step_index": 11
        }
    },
    "jump": {
        "fields": {
            "timestamp": 253,
            "distance": 0,
            "height": 1,
            "rotations": 2,
            "hang_time": 3,
            "score": 4,
            "position_lat": 5,
            "position_long": 6,
            "speed": 7,
            "enhanced_speed": 8
        }
    },
    "course": {
        "fields": {
            "sport": 4,
            "name": 5,
            "capabilities": 6,
            "sub_sport": 7
        }
    },
    "course_point": {
        "fields": {
            "message_index": 254,
            "timestamp": 1,
            "position_lat": 2,
            "position_long": 3,
            "distance": 4,
            "type": 5,
            "name": 6,
            "favorite": 8
        }
    }
};

