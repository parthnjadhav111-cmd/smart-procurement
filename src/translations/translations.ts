import { Language } from '../types';

export interface TranslationDict {
  app_title: string;
  app_subtitle: string;
  welcome: string;
  home: string;
  centers: string;
  schedule: string;
  queue: string;
  profile: string;
  my_profile: string;
  nearest_center: string;
  my_schedule: string;
  track_queue: string;
  view_profile: string;
  view_details: string;
  get_directions: string;
  view_schedule: string;
  view_center: string;
  distance_away: string;
  available_slots: string;
  current_queue: string;
  open_status: string;
  closed_status: string;
  farmers_ahead: string;
  estimated_wait: string;
  recommended_arrival: string;
  your_token: string;
  currently_serving: string;
  book_slot: string;
  register_crop: string;
  crop_type: string;
  estimated_quantity: string;
  harvest_status: string;
  confirm_booking: string;
  token_id: string;
  digital_token: string;
  cancel_appointment: string;
  reschedule_appointment: string;
  late_arrival_warning: string;
  join_current_queue: string;
  turn_arrived_alert: string;
  update_location: string;
  select_district: string;
  filter_by_crop: string;
  sort_by: string;
  nearest: string;
  highest_availability: string;
  highest_rating: string;
  all_districts: string;
  all_crops: string;
  procurement_status: string;
  weighing: string;
  quality_check: string;
  payment_status: string;
  notifications: string;
  language: string;
  ai_prediction: string;
  formula_wait: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    app_title: 'Smart Procurement',
    app_subtitle: 'Government Agricultural Procurement Portal',
    welcome: 'Welcome',
    home: 'Home',
    centers: 'Centers',
    schedule: 'Schedule',
    queue: 'Track Queue',
    profile: 'Profile',
    my_profile: 'My Profile',
    nearest_center: 'Nearest Procurement Center',
    my_schedule: 'My Schedule',
    track_queue: 'Track Live Queue',
    view_profile: 'View Profile',
    view_details: 'View Details',
    get_directions: 'Get Directions',
    view_schedule: 'View Schedule',
    view_center: 'View Center',
    distance_away: 'away',
    available_slots: 'Available Slots',
    current_queue: 'Current Queue',
    open_status: 'Open / Accepting Farmers',
    closed_status: 'Closed',
    farmers_ahead: 'Farmers Ahead',
    estimated_wait: 'Estimated Waiting Time',
    recommended_arrival: 'Recommended Arrival',
    your_token: 'Your Token',
    currently_serving: 'Currently Serving',
    book_slot: 'Book Procurement Slot',
    register_crop: 'Register Crop',
    crop_type: 'Crop Type',
    estimated_quantity: 'Estimated Quantity',
    harvest_status: 'Harvest Status',
    confirm_booking: 'Confirm Booking',
    token_id: 'Token ID',
    digital_token: 'Digital Procurement Token',
    cancel_appointment: 'Cancel Appointment',
    reschedule_appointment: 'Reschedule',
    late_arrival_warning: 'Your scheduled slot has expired.',
    join_current_queue: 'Join Current Queue',
    turn_arrived_alert: 'Your turn has arrived. Please proceed to the procurement counter.',
    update_location: 'Update Location',
    select_district: 'Select District',
    filter_by_crop: 'Filter by Crop',
    sort_by: 'Sort by',
    nearest: 'Nearest',
    highest_availability: 'Highest Availability',
    highest_rating: 'Highest Rating',
    all_districts: 'All Districts',
    all_crops: 'All Crops',
    procurement_status: 'Procurement Status Tracking',
    weighing: 'Weighing',
    quality_check: 'Quality Verification',
    payment_status: 'Payment Status',
    notifications: 'Notifications',
    language: 'Language',
    ai_prediction: 'AI Predicted Wait',
    formula_wait: 'Standard Calculation',
  },
  hi: {
    app_title: 'स्मार्ट खरीद',
    app_subtitle: 'सरकारी कृषि खरीद प्रबंधन पोर्टल',
    welcome: 'स्वागत है',
    home: 'होम',
    centers: 'खरीद केंद्र',
    schedule: 'शेड्यूल',
    queue: 'कतार ट्रैक करें',
    profile: 'प्रोफाइल',
    my_profile: 'मेरी प्रोफाइल',
    nearest_center: 'निकटतम खरीद केंद्र',
    my_schedule: 'मेरा शेड्यूल',
    track_queue: 'लाइव कतार ट्रैक करें',
    view_profile: 'प्रोफाइल देखें',
    view_details: 'विवरण देखें',
    get_directions: 'दिशा-निर्देश पाएं',
    view_schedule: 'शेड्यूल देखें',
    view_center: 'केंद्र देखें',
    distance_away: 'दूरी पर',
    available_slots: 'उपलब्ध स्लॉट',
    current_queue: 'वर्तमान कतार',
    open_status: 'खुला है / किसान स्वीकार्य',
    closed_status: 'बंद है',
    farmers_ahead: 'आगे के किसान',
    estimated_wait: 'अनुमानित प्रतीक्षा समय',
    recommended_arrival: 'पहुंचने का अनुशंसित समय',
    your_token: 'आपका टोकन',
    currently_serving: 'वर्तमान में सेवारत',
    book_slot: 'खरीद स्लॉट बुक करें',
    register_crop: 'फसल पंजीकृत करें',
    crop_type: 'फसल का प्रकार',
    estimated_quantity: 'अनुमानित मात्रा',
    harvest_status: 'कटाई की स्थिति',
    confirm_booking: 'बुकिंग की पुष्टि करें',
    token_id: 'टोकन आईडी',
    digital_token: 'डिजिटल खरीद टोकन',
    cancel_appointment: 'अपॉइंटमेंट रद्द करें',
    reschedule_appointment: 'पुनर्निर्धारित करें',
    late_arrival_warning: 'आपका निर्धारित स्लॉट समाप्त हो गया है।',
    join_current_queue: 'वर्तमान कतार में शामिल हों',
    turn_arrived_alert: 'आपकी बारी आ गई है। कृपया खरीद काउंटर पर जाएं।',
    update_location: 'स्थान अपडेट करें',
    select_district: 'जिला चुनें',
    filter_by_crop: 'फसल अनुसार छांटें',
    sort_by: 'क्रमबद्ध करें',
    nearest: 'निकटतम',
    highest_availability: 'अधिकतम उपलब्धता',
    highest_rating: 'सर्वोत्तम रेटिंग',
    all_districts: 'सभी जिले',
    all_crops: 'सभी फसलें',
    procurement_status: 'खरीद स्थिति ट्रैकिंग',
    weighing: 'वजन प्रक्रिया',
    quality_check: 'गुणवत्ता सत्यापन',
    payment_status: 'भुगतान स्थिति',
    notifications: 'सूचनाएं',
    language: 'भाषा',
    ai_prediction: 'AI अनुमानित समय',
    formula_wait: 'मानक गणना',
  },
  mr: {
    app_title: 'स्मार्ट खरेदी',
    app_subtitle: 'शासकीय शेतमाल खरेदी व्यवस्थापन पोर्टल',
    welcome: 'स्वागत आहे',
    home: 'मुख्यपृष्ठ',
    centers: 'खरेदी केंद्र',
    schedule: 'वेळापत्रक',
    queue: 'थेट रांग',
    profile: 'माझी माहिती',
    my_profile: 'शेतकरी प्रोफाइल',
    nearest_center: 'जवळचे खरेदी केंद्र',
    my_schedule: 'माझे वेळापत्रक',
    track_queue: 'थेट रांग (कतार) तपासा',
    view_profile: 'माहिती पहा',
    view_details: 'तपशील पहा',
    get_directions: 'रस्ता मार्ग पहा',
    view_schedule: 'वेळापत्रक पहा',
    view_center: 'केंद्र पहा',
    distance_away: 'अंतरावर',
    available_slots: 'उपलब्ध स्लॉट',
    current_queue: 'सध्याची रांग',
    open_status: 'सुरू आहे / शेतकरी स्वागत',
    closed_status: 'बंद आहे',
    farmers_ahead: 'पुढील शेतकरी',
    estimated_wait: 'अंदाजे प्रतीक्षा वेळ',
    recommended_arrival: 'केंद्रावर येण्याची वेळ',
    your_token: 'तुमचा टोकन',
    currently_serving: 'सध्या चालू टोकन',
    book_slot: 'खरेदी स्लॉट बुक करा',
    register_crop: 'पीक नोंदणी करा',
    crop_type: 'पिकाचा प्रकार',
    estimated_quantity: 'अंदाजे प्रमाण',
    harvest_status: 'कापणी स्थिती',
    confirm_booking: 'बुकिंग निश्चित करा',
    token_id: 'टोकन क्रमांक',
    digital_token: 'डिजिटल खरेदी टोकन पावती',
    cancel_appointment: 'वेळापत्रक रद्द करा',
    reschedule_appointment: 'पुन्हा वेळ बदला',
    late_arrival_warning: 'आपला निर्धारित वेळ संपला आहे.',
    join_current_queue: 'सध्याच्या थेट रांगेत सामील व्हा',
    turn_arrived_alert: 'आपली पाळी आली आहे! कृपया खरेदी काऊंटरवर उपस्थित व्हा.',
    update_location: 'स्थान अपडेट करा',
    select_district: 'जिल्हा निवडा',
    filter_by_crop: 'पिकानुसार निवडा',
    sort_by: 'क्रमवारी',
    nearest: 'सर्वात जवळचे',
    highest_availability: 'जास्त स्लॉट उपलब्ध',
    highest_rating: 'उत्कृष्ट रेटिंग',
    all_districts: 'सर्व जिल्हे',
    all_crops: 'सर्व पिके',
    procurement_status: 'खरेदी प्रगती स्थिती',
    weighing: 'वजन तपासणी',
    quality_check: 'दर्जा पडताळणी',
    payment_status: 'रक्कम जमा स्थिती',
    notifications: 'सूचना',
    language: 'भाषा',
    ai_prediction: 'AI अंदाजित वेळ',
    formula_wait: 'प्रमाणित सूत्र गणना',
  },
};
