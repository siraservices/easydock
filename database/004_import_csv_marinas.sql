-- EasyDock v1.2 - CSV Marina Import
-- Run AFTER database/003_marina_claim_flow.sql
-- Imports 241 unclaimed marinas from marinas.com South Florida dataset
-- All records: owner_id = NULL (unclaimed), is_active = FALSE, source = 'csv_import'

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('The Palm Tree Club', '1819 79th Street Causeway', 'North Bay Village', 'FL', '33141', '+13058661570', 'www.shuckersbarandgrill.com', 25.84950180332217, -80.14863354250842, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Hillsboro Inlet Fishing Center', '2705 N Riverside Drive', 'Pompano', 'FL', '33062', '(954) 943-8222', 'www.hillsboroinletfishcenter.com', 26.261465, -80.084826, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Safe Harbor North Palm Beach', '1037 Marina Drive', 'North Palm Beach', 'FL', '33408', '+15616264919', NULL, 26.82748419741446, -80.05860256703323, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Bradford Marine', '3051 State Rd 84', 'Fort Lauderdale', 'FL', '33312', '954-791-3800', 'www.bradford-marine.com', 26.08636473714462, -80.18606484184635, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('HAVN Yacht Club', '184 Lake Drive', 'Palm Beach Shores', 'FL', '33404', '+15618487469', NULL, 26.7803617483457, -80.04047881412795, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Riviera Beach Marina Village', '200 East 13th Street', 'Riviera Beach', 'FL', '33404', '+15618427806', NULL, 26.773327, -80.051756, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Merritt Boat \u0026 Engine Works', '2931 NE 16th St', 'Pompano Beach', 'FL', '33062', '(954) 941-5207', NULL, 26.25231851198035, -80.09016794832539, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Pompano Beach Marine Center Inc', '701 S Federal Hwy', 'Pompano Beach', 'FL', '33062', '(954) 946-1450', 'www.pompanoboats.com', 26.224615291704367, -80.10405484593753, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('MarineMax Pompano - Service Center', '750 S Federal Hwy', 'Pompano Beach', 'FL', '33062', '(954) 618-0440', 'www.marinemax.com', 26.222034566495623, -80.10266747211355, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Hillsboro Inlet Marina (private)', '2629 N. Riverside Dr', 'Pompano Beach', 'FL', '33062', '954-943-8222\t', 'www.hillsboroinletfishcenter.com', 26.2616249674667, -80.08395012816219, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Broward Marine', '750 NE 7th Ave.', 'Dania Beach', 'FL', '33004', '(954)-927-4119', 'www.browardshipyard.com', 26.061463086556955, -80.13061474489372, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Power House Marina', '13255 Biscayne Blvd', 'North Miami', 'FL', '33181-2014', '(305) 892-2628', 'www.powerhousemarina.com', 25.898350251962384, -80.16051541227024, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Royale Palm Yacht Basin - Marrone Investments', '\t629 NE 3rd Street', 'Dania Beach', 'FL', '33004', '+19549235900', NULL, 26.059036382226253, -80.13351270913547, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Pier 17 Marina \u0026 Yacht Club', '1500 SW 17th Street', 'Fort Lauderdale', 'FL', '33312', '(195) 473-4937', NULL, 26.0983009, -80.1624985, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Delray Harbor Club Marina', '1035 S. Federal Hwy', 'Delray Beach', 'FL', '33483', '561-276-0376', NULL, 26.44555822006963, -80.0658953133016, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Biscayne Bay Yacht Club', '2540 South Bayshore Drive', 'Coconut Grove', 'FL', '33133', '305 858-6303', 'www.biscaynebayyachtclub.com', 25.731298231935938, -80.23083087168608, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Mid River Marine', '413 SW 3rd Ave', 'Fort Lauderdale', 'FL', '33315', '954-646-7131', NULL, 26.118744262926327, -80.14804061481881, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('IGY Yacht Haven Grande Miami at Island Garden', '888 MacArthur Causeway', 'Miami', 'FL', '33132', '305-531-3747', NULL, 25.78524148, -80.17856491, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('North Bay Landing Marina', '7601 E Treasure Dr # 1701', 'North Bay Village', 'FL', '33141-4366', '(305) 861-6000', NULL, 25.8483009, -80.1449966, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('FoxStays Docks', '200 Plaza Las Olas', 'Fort Lauderdale', 'FL', '33301', '+19544661642', NULL, 26.12067395998454, -80.1103304530881, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Bal Harbour Yacht Club', '200 Bal Bay Drive', 'Bal Harbour', 'FL', '33154', '(305) 865-6048', 'www.balharbouryachtclub.com', 25.89512445032942, -80.12846859889288, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Dania Beach Offshore', '90 North Bryan Road', 'Dania Beach', 'FL', '33004', '954-920-5595', 'www.daniabeachoffshore.com', 26.052902, -80.155922, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Angler''s Avenue Marine Center', '4470 Anglers Ave', 'Dania Beach', 'FL', '33312', '+19549628702', 'www.aamcmarina.com', 26.06721006956536, -80.16752538492952, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Reliable Fuel', '1825 Ponce de Leon Blvd', 'Coral Gables', 'FL', '33134', '+17869295509', NULL, 25.7554528231327, -80.25854161981094, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('The Bluffs Marina', '1377 Tidal Pointe Blvd', 'Jupiter', 'FL', '33477', '+15614083993', 'www.thebluffsmarinajupiter.com', 26.89370193567306, -80.07161939692243, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Harbour Towne Marina', '801 NE 3rd Street', 'Dania', 'FL', '33004', '(954) 926-0300', NULL, 26.05934523011075, -80.13101900875338, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('La Coloma Marina', '243 NW South River Dr', 'Miami', 'FL', '33128-1530', '(305) 325-9702', NULL, 25.77603790297536, -80.20369406456032, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Griffin Harbor Marina', '2051 Griffin Rd', 'Fort Lauderdale', 'FL', '33312', '954-964-4444', NULL, 26.064401859950365, -80.16124813993456, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Dania Beach Marina', '151 North Beach Rd', 'Dania Beach', 'FL', '33004-3023', '954-924-3796', NULL, 26.05585113721901, -80.11293787004634, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Cable Marine Inc. - Cable West', '2491 SW State Road 84', 'Fort Lauderdale', 'FL', '33312', '800-424-5027', 'www.cablemarine.com', 26.08930675535582, -80.17340141000066, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Miami Yacht \u0026 Engine Works', '2100 NW North River Drive', 'Miami', 'FL', '33125', '305-325-0233', NULL, 25.7891998, -80.2285995, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Intracoastal Marina', '16900 N Bay Road', 'Miami Beach', 'FL', '33160', '+17275953592', NULL, 25.93220246276648, -80.1273582857879, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Jupiter Inlet Marina', '1095 North A1A', 'Jupiter', 'FL', '33477', '5612033220', NULL, 26.94638458626997, -80.08426467531967, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Lauderdale Yacht Club', '1725 SE 12th Street', 'Fort Lauderdale', 'FL', '33316', '954-818-1457', 'www.lyc1938.org', 26.10843398751227, -80.1245157999631, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Gator Harbour West Marina', '7930 East Drive', 'North Bay Village', 'FL', '33141', '(305) 754-2200', 'www.clubnauticomiami.com', 25.8528633, -80.1578522, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Loggerhead Plaza', '14255 U.S. Hwy 1', 'Juno Beach', 'FL', '33408', '+15616272702', NULL, 26.88481386289729, -80.0580204323848, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Miami Yacht Club', '1001 MacArthur Causeway', 'Miami', 'FL', '33132', '305-377 9877', 'www.miamiyachtclub.com', 25.78592313286417, -80.17269637248675, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('North Beach Marina', '724 NE 79th St', 'Miami', 'FL', '33138-4712', '+13057588888', NULL, 25.84709609800085, -80.18181094701718, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Royal Palm Yacht Club', '2425 W Maya Palm Dr', 'Boca Raton', 'FL', '33432', '561-395-2100', 'www.rpycc.org', 26.325180459948726, -80.08810109707517, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Lighthouse Point Marina', '8610 Bay Pines Blvd', 'St Petersburg', 'FL', '33709', '(727) 384-3625', NULL, 27.811387779008, -82.76017135172748, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Rolly Marine', '2551 State Road 84', 'Fort lauderdale', 'FL', '33312', '(954) 583-5300', 'www.rolly-marine.com', 26.09061339879429, -80.17568732938769, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Wilshire Marina', '2308 N Ocean Drive', 'Hollywood', 'FL', '33022', '(954) 927- 0777', NULL, 26.0263996, -80.1166992, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Hidden Harbour Marina, Pompano Beach', '2315 NE 15th St', 'Pompano Beach', 'FL', '33060', '954-941-0498', 'www.hidden-harbourmarina.com', 26.252113281821423, -80.09942300214547, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Taha Marine Center', '3109 E Atlantic Blvd', 'Pompano Beach', 'FL', '33062', '(954) 785-4737', NULL, 26.23250608874713, -80.09318587837808, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Grove Key Marina', '3385 Pan American Drive', 'Miami', 'FL', '33133', '(305) 858-6527', 'www.sailmiami.com', 25.72852725050764, -80.23351557487922, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Cocoplum Yacht Club', '6500 Prado Blvd', 'Coral Gables', 'FL', '33143', '(305) 663-1353', 'www.cocoplumyachtclub.com', 25.7049999, -80.2502975, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Coral Reef Yacht Club', '2484 South Bayshore Drive', 'Miami', 'FL', '33133', '(305) 858-1733', 'www.coralreefyachtclub.org', 25.731666255800278, -80.22993307720728, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Key Biscayne Yacht Club', '180 Harbor Dr', 'Key Biscayne', 'FL', '33149', '(305) 361-8229', 'www.kbyc.org', 25.69976065508564, -80.16883412054271, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Hurricane Cove Marina', '1884 NW North River Drive', 'Miami', 'FL', '33125', '+13053248004', NULL, 25.78711539145385, -80.22771061304792, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Popeye Marina', '830 NW 8th Street', 'Miami', 'FL', '33136', '(305) 325-8187', NULL, 25.781973531818124, -80.20774614169474, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Snapper Creek Marina', '11190 Snapper Creek Road', 'Coral Gables', 'FL', '33156', '305-661-0505', NULL, 25.6667004, -80.2807999, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Jupiter Pointe Marina', '18701 SE Federal Hwy', 'Tequesta', 'FL', '33469-1719', '561-746-2600', NULL, 26.97586221459113, -80.08718300281723, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('West Palm City Docks', '401 Clematis Street', 'West Palm Beach', 'FL', '33401', '(561) 822-2222', 'www.thepalmbeaches.com', 26.71037377198647, -80.04865384367105, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Grove Isle Marina', '4 Grove Isle Dr', 'Coconut Grove', 'FL', '33133', '3058584753', NULL, 25.7363808498241, -80.21948613855155, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Safe Harbor New Port Cove', '255 E. 22nd Court', 'Riviera Beach', 'FL', '33404-5615', '+15618442504', NULL, 26.78019250078967, -80.04998924199404, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Jupiter Waterfront Inn', '18903 SE Federal Hwy', 'Tequesta', 'FL', '33469', '(561) 747-9085, 1-888-747-9085', 'www.jupiterwaterfrontinn.com', 26.9741993, -80.0875015, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Playboy Marine Center', '760 Taylor Lane', 'Dania Beach', 'FL', '33004', '(954) 920- 0533', 'www.playboymarine.com', 26.06047155070634, -80.13237269145613, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Miami Boat Locker', '3250 NW N River Dr', 'Miami', 'FL', '33142', '(305) 871-9588', NULL, 25.80014743078452, -80.24991677033647, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Banyan Bay Marina', '4491 Ravenswood Rd', 'Fort Lauderdale', 'FL', '33312-5751', '954-893-0004', 'www.banyanbaymarina.com', 26.066690476800915, -80.16952783373772, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Loggerhead Marina at South Miami', '24777 SW 87th Avenue', 'Miami', 'FL', '33032', '305-258-3500', NULL, 25.537661392604335, -80.32685637535468, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Loggerhead Marina at Jupiter', '3238 Casseekey Island Rd', 'Jupiter', 'FL', '33477-1301', '561-747-8980', NULL, 26.918547116494167, -80.08105608776408, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Marina Village at Bahia Mar', '849 Seabreeze Blvd', 'Fort Lauderdale', 'FL', '33316', '+19542535970', 'www.marinavillageftl.com', 26.11199732808745, -80.10597022804944, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Kingsley Plantation Dock', '11676 Palmetto Avenue', 'Jacksonville', 'FL', '32226', '904-251-3537', 'www.nps.gov', 30.441093419682346, -81.43915465490294, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Milt''s Marina', '60 Cat Cay Court', 'Dania', 'FL', '33004', '401-885-3700.', NULL, 26.0606136, -80.159317, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Palm Harbor Marina', '400  North Flagler Drive, Suite A', 'West Palm Beach', 'FL', '33401', '+15616554757', 'www.palmharbor-marina.com', 26.716163024332673, -80.04878778212529, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Herbert Hoover Marina at Homestead Bayfront Park', '9698  SW 328th St', 'Homestead', 'FL', '33033', '(305) 230-3033', 'www.miamidade.gov', 25.46226555419564, -80.34028063610087, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Cozy Cove Marina', '300 North Federal Highway', 'Dania', 'FL', '33004', '954-921-8800', 'www.cozycovemarina.com', 26.058953858376057, -80.14309131616922, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Harbour Point Marina', '2221 Monet Road', 'West Palm Beach', 'FL', '33410', '561-799-9590', 'www.hmy.com', 26.837696038591616, -80.06769455568282, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Biscayne National Park Marina', '9700 SW 328th St', 'Homestead', 'FL', '33033', '(305) 230-7275', 'www.miamidade.gov', 25.46368873679114, -80.33417010645786, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Banyan Resort Marina', '111 Isle of Venice Drive', 'Fort Lauderdale', 'FL', '33301', '+13052967786', 'www.banyanmarina.com', 26.1256008, -80.1213989, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('The Ways Boat Yard', '2300 Idlewilde Road', 'Palm Beach Gardens', 'FL', '33410', '561-622-8550', NULL, 26.847814048835417, -80.06720978775014, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Captain Paul''s Landing', '1111 Love Street', 'Jupiter', 'FL', '33458', '+17278248007', NULL, 26.9461002, -80.0817032, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Jockey Club Marina', '11111 Biscayne Blvd', 'Miami', 'FL', '33181', '305-899-9629', 'www.thejockeyclubmiami.com', 25.87856344690698, -80.16322809241106, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Palm Bay Club Marina', '759 N.E. 69th Street', 'Miami', 'FL', '33138', '305-751-3700', 'www.palmbayclubmarina.com', 25.837639635153792, -80.17911891208138, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Coconut Bay Resort', '919 North Birch Road', 'Fort Lauderdale', 'FL', '33304', '954-563-4229', 'www.coconutbay.org', 26.137104125336222, -80.10653980366953, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Universal Marine Center', '2700 SW 25th Ter.', 'Fort Lauderdale', 'FL', '33312', '954-791-0550', NULL, 26.08969935545437, -80.17461955228254, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Complete Marine', '800 South Federal Highway', 'Pompano Beach', 'FL', '33062', '954-567-2628', NULL, 26.220929745325435, -80.10346399101996, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('InterMarine - Fort Lauderdale', '4550 Anglers Avenue', 'Fort Lauderdale', 'FL', '33312', '954-894-9895', 'www.intermarineboats.com', 26.06531943406368, -80.16697510440395, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('InterMarine - Dania', '320 North Federal Hwy', 'Dania', 'FL', '33004', '954-922-5500', 'www.intermarineboats.com', 26.05920120716233, -80.1435378929339, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Bill Bird Marina at Haulover Park', '10800 Collins Avenue', 'Miami Beach', 'FL', '33154', '305-947-3525', 'www.miamidade.gov', 25.906680683813704, -80.12520808324922, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Delray Beach City Marina', '159 Marine Way', 'Delray Beach', 'FL', '33444', '(561) 243-7250 ext 7255', 'www.delraybeachfl.gov', 26.4589449180676, -80.06466870209711, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Grandview Palace Marina', '7601 E. Treasure Drive', 'North Bay Village', 'FL', '33141', '305-300-6828', NULL, 25.847985650998623, -80.14463532621937, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Boynton Harbor Marina', '735 Casa Loma Blvd', 'Boynton Beach', 'FL', '33435', '+15617357955', 'www.boyntonbeachcra.com', 26.5276789890143, -80.05474907763735, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('The Seagate Yacht Club', '110 MacFarlane Drive', 'Delray Beach', 'FL', '33444', '+15615739462', 'www.seagatedelray.com', 26.45866811753829, -80.06381422368823, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Lauderdale Small Boat Club', '1740 SW 42 Street', 'Fort Lauderdale', 'FL', '33315', '954-359-7659', 'www.l-s-b-c.com', 26.06816666666389, -80.1635, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Ft. Lauderdale Boatyard \u0026 Marina', '1915 SW 21st Ave', 'Fort Lauderdale', 'FL', '33312', '843.576.2499\t', NULL, 26.09719537139867, -80.16998116168483, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Pier Sixty-Six Marina', '2301 SE 17th Street', 'Fort Lauderdale', 'FL', '33316', '+19547283578', 'www.piersixtysixmarina.com', 26.10213350580082, -80.11735299009801, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Ft. Lauderdale BoatClub', '1915 SW 21st Avenue', 'Fort Lauderdale', 'FL', '33312', '954 797-PIER', 'www.boatclubsamerica.com', 26.0980434, -80.1701279, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Sunny Isles Marina', '400 Sunny Isles Blvd', 'Sunny Isles Beach', 'FL', '33160', '(305) 945-6000', 'www.waterwayrealty.com', 25.928731265505775, -80.12851496030943, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Boathouse Marine Center', '599 South Federal Hwy', 'Pompano', 'FL', '33062', '+19549433200', NULL, 26.22630126401373, -80.1037060509791, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Marina Bay Marina', '2525 Marina Bay Drive West', 'Fort Lauderdale', 'FL', '33312', '+19547917600', NULL, 26.0932289956374, -80.17118035006565, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Grove Harbour Marina', '2640 S Bayshore Drive', 'Miami', 'FL', '33133', '305-854-6444', 'www.groveharbourmarina.com', 25.729959431988448, -80.23284045372326, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Austral International Marina', '2190 N.w. North River Drive', 'Miami', 'FL', '33125', '305-325-0177', 'www.australinternational.net', 25.789262634238696, -80.23102719114186, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Las Olas Marina', '151 Las Olas Cir', 'Ft Lauderdale', 'FL', '33316', '+19547566557', NULL, 26.12173894640163, -80.10822582785104, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('IGY Marinas - Island Global Yachting', NULL, 'Fort Lauderdale', 'FL', NULL, '9543322398', NULL, 26.1005993, -80.1219025, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Boathouse Yacht Facility', '1601 SE 16th Street', 'Fort Lauderdale', 'FL', '33316', '+19549148949', NULL, 26.102420871857035, -80.12511605577825, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Vice City Marina', '801 Brickell Bay Drive', 'Miami', 'FL', '33131', '+13052399903', NULL, 25.765175, -80.18813, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Matheson Hammock Marina', '9610 Old Cutler Rd', 'Miami', 'FL', '33156', '305-665-5475', 'www.miamidade.gov', 25.6796665, -80.2591629, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Miami Outboard Club', '1099 MacArthur Causeway', 'Miami', 'FL', '33133', '305-379-3000', 'www.mocmiami.com', 25.7817001, -80.1718979, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Cypress Island Marina', '2775 Cypress Island Drive', 'Palm Beach Gardens', 'FL', '33410', '561-626-1792', 'www.cypressislandmarina.com', 26.888842431289987, -80.0746586506804, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Rybovich Superyacht Marina', '4200 N Flagler Dr', 'West Palm Beach', 'FL', '33407-4294', '561- 844-1800', 'www.rybovich.com', 26.749025944793104, -80.0500286433531, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Yacht Management', '3001 W State Rd 84', 'Fort Lauderdale', 'FL', '33312', '954-941-6447', NULL, 26.085798658856362, -80.18386442208795, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Pelican Harbor Marina', '1275 NE 79th Street', 'Miami', 'FL', '33138', '(305) 754-9330', 'www.miamidade.gov', 25.849632857255656, -80.165679493688, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Soverel Harbour Marina', '2401 PGA Blvd.', 'Palm Beach Gardens', 'FL', '33410', '561-691-9554', 'www.soverelmarina.com', 26.84601380098023, -80.07039258507719, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Dinner Key Marina', '3400 Pan American Drive', 'Miami', 'FL', '33133', '305-329-4755', 'www.miamigov.com', 25.725917330679593, -80.23350416191197, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Marina Delray Inc', '777 Palm Trail', 'Delray Beach', 'FL', '33483', '561-276-7666', 'www.marinadelray.com', 26.473729853184224, -80.06263043260526, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('South Miami-Dade Marina \u0026 Eco Adventures', '54400 S Dixie Hwy', 'Homestead', 'FL', '33030', '(305) 247-8730', 'www.southdademarina.com', 25.267072042283118, -80.43937144284611, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Buccaneer Marina', '142 Lake Drive', 'Palm Beach Shores', 'FL', '33404', '561-842-1620', NULL, 26.77910888372513, -80.03991632407886, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Marina Mar', '3100 E Oakland Park Blvd.', 'Fort Lauderdale', 'FL', '33308', '(954) 563-7101', NULL, 26.166979797907246, -80.10375835066677, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Flamingo Marina', '1 Flamingo Lodge Hwy', 'Homestead', 'FL', '33034', '2396951095', NULL, 25.142398978980836, -80.92277965127012, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Crandon Park Marina', '4000 Crandon Blvd', 'Key Biscayne', 'FL', '33149', '305-361-1281', 'www.miamidade.gov', 25.725551467297194, -80.15609838314008, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Cay Marine Services', '501 NW South River Dr', 'Miami', 'FL', '33136', '305-545-5700', 'www.caymarineservice.com', 25.779045129955094, -80.2090038354598, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Anchor Marine', '961 N.W. 7th St', 'Miami', 'FL', '33136', '305-545-6348', 'www.anchormarinemiami.com', 25.78052893280679, -80.21071373082175, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Lott Brothers Marina', '631 Northlake Blvd', 'North Palm Beach', 'FL', '33408', '(561) 844-0244', 'www.lottbros.com', 26.80843717089641, -80.06739356964235, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Palm Beach Sailing Club', '4600 North Flagler Drive', 'West Palm Beach', 'FL', '33407', '561-881-0809', 'www.pbsail.org', 26.753018846257177, -80.05117941112994, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Murray Marine the Palm Beaches', '1616 Broadway', 'Riviera Beach', 'FL', '33404', '561-842-4582', 'www.murraymarineservices.com', 26.77672, -80.0546646, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Viking Yacht Service Center', '1550 Avenue C', 'Riviera Beach', 'FL', '33404', '561-493-2800', 'www.vikingyachts.com', 26.7759733129608, -80.05149655364433, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Riverfront Marina', '420 SW 3rd Avenue', 'Fort Lauderdale', 'FL', '33315', '(954) 527-1829', 'www.riverfrontmarina.com', 26.118083631469972, -80.14595135429275, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Two Georges at the Cove Marina', '1756 SE 3rd Ct', 'Deerfield Beach', 'FL', '33441', '954-427-0353, 954-421-9272', 'www.twogeorgesrestaurant.com', 26.31316831272804, -80.08134117496454, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Seminole Marine', '2208 Idlewilde Rd', 'Palm Beach Gardens', 'FL', '33410-2599', '561-622-7600', NULL, 26.84737, -80.06695, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Boater''s Grill', '1200 Crandon Blvd', 'Key Biscayne', 'FL', '33149', '+13053610080', NULL, 25.67538434927208, -80.16154318974587, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Deering Bay Yacht Club', '13660 Deering Bay Drive', 'Miami', 'FL', '33158', '305-254-2111', 'www.dbycc.com', 25.635449173435518, -80.2939071780274, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Jones Boat Yard', '3399 NW South River Dr', 'Miami', 'FL', '33142', '305-635-0891', 'www.jonesdrydock.com', 25.800124059976156, -80.25115123878679, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Black Point Marina', '24777 Southwest 87th Avenue', 'Miami', 'FL', '33190', '305-258-4092', 'www.miamidade.gov', 25.539477150582485, -80.32937509838779, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Plantation Inn \u0026 Golf Resort: Marina', '9301 W Fort Island Trl', 'Crystal River', 'FL', '34428', '352-795-4211', NULL, 28.878753827141907, -82.59050414855233, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('MarineMax East Florida Yacht Center', '490 Taylor Lane', 'Dania Beach', 'FL', '33004', '954-926-0308', 'www.marinemax.com', 26.0608006, -80.1361008, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Museum Park Marina', '1075 North Biscayne Blvd', 'Miami', 'FL', '33132', '305-632-1242', 'www.yachtsmyth.com', 25.783032, -80.187387, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Norseman Shipbuilding Marine', '437 NW South River Drive', 'Miami', 'FL', '33133', '(305) 545-6815', 'www.norsemanshipbuilding.com', 25.77852018049569, -80.20802402025757, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('One Island Park - Miami Beach', '120 MacArthur Causeway', 'Miami Beach', 'FL', '33139', '+1 305 285 8340', NULL, 25.7700857, -80.1465416, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Loggerhead Marina at Aventura', '3601 NE 207th St', 'North Miami Beach', 'FL', '33180', '305-935-4295, 954-457-8557', NULL, 25.97050659444794, -80.12858805195042, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Loggerhead Marina at Hollywood', '1400 Marina Dr', 'Hollywood', 'FL', '33019', '954-457-8557', NULL, 26.002653903605164, -80.12123267425001, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Yacht Haven Park \u0026 Marina', '2323 W State Road 84', 'Fort Lauderdale', 'FL', '33312-4835', '(954) 583-2322', NULL, 26.09430493513203, -80.1728942510286, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Marina Village at Boynton Beach', '735 Casa Loma Blvd', 'Boynton Beach', 'FL', '33435', '561-735-7955', 'www.marinavillagemarina.com', 26.528489319423414, -80.05469473653672, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Loggerhead Marina at Lantana', '870 N Federal Highway', 'Lantana', 'FL', '33462', '561-582-4422', NULL, 26.592529912624983, -80.04833652094788, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Loggerhead Marina at Riviera Beach', '2620 Lakeshore Dr', 'Riviera Beach', 'FL', '33404', '561-840-6868', NULL, 26.785026541013536, -80.0490882711179, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Sea Ranch Club of Boca', '4301 N Ocean Blvd', 'Boca Raton', 'FL', '33431', '(561) 395-0447', 'www.searanchclubofboca.com', 26.3886045525835, -80.0692958306885, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Best Western On the Bay and Marina', '1819 79th Street Causeway', 'Miami', 'FL', '33147', '(305) 865-7100', NULL, 25.8493996, -80.1472015, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Loggerhead Marina at Palm Beach Gardens', '2700 Donald Ross Road', 'Palm Beach Gardens', 'FL', '33410', '+15616276358', NULL, 26.8801682209894, -80.07356376299954, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Anchorage Park Marina Ramp', '606 Anchorage Dr', 'North Palm Beach', 'FL', '33408', '561-841-3386', 'www.village-npb.org', 26.81389731330833, -80.06842867601206, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Regal Yachting Marina,Miami', '2215 NW 14th St', 'Miami', 'FL', '33125', '855-583-5700', NULL, 25.788004, -80.23168, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Discount Dockage', '2810 NE 30th St', 'Fort Lauderdale', 'FL', '33306', '+19544947569', NULL, 26.17754561621409, -80.11986822910367, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Sundance Marine', '1335 SE 16th Street', 'Fort Lauderdale', 'FL', '33316', '954-522-2800', NULL, 26.1014004, -80.1292038, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Oceanika Yachts Marina \u0026 Brokerage', '3480 NW 21st St', 'Miami', 'FL', '33142', '305-634-1682', 'www.oceanikayacht.com', 25.794840160387636, -80.25076970954392, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Las Olas Mooring Area', '240 Las Olas Cir', 'Fort Lauderdale', 'FL', '33316', '954-828-7200', NULL, 26.1210995, -80.1082993, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Marina One Yacht Club \u0026 Marina', '580 \u0026 609 North Federal Highway', 'Deerfield Beach', 'FL', '33441', '(954) 421-2500', NULL, 26.324321717798043, -80.08924228083296, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('JIB Yacht Club \u0026 Marina', '46 Beach Road', 'Jupiter', 'FL', '33469', '+15617464300', 'www.jibmarinajupiter.com', 26.95169254041693, -80.07708178166607, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Loggerhead Club \u0026 Marina - North Miami Beach', '17201 Biscayne Blvd', 'North Miami Beach', 'FL', '33160', '(305) 258-3500', NULL, 25.9335995, -80.1500015, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Hi-Lift Marina', '2890 N.E. 187th Street', 'Aventura', 'FL', '33180', '305-931-2550', NULL, 25.9482994, -80.1417007, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Aquamarina Oceanside', '300 SW 1st Ave', 'Ft Lauderdale', 'FL', '33301', '+15612516394', NULL, 26.22001, -80.09147, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Admiral''s Cove Marina', '300 Admirals Cove Blvd', 'Jupiter', 'FL', '33477', '+15617455930', 'www.admiralscove.net', 26.90957523829788, -80.0840842458418, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Sands Harbor Resort \u0026 Marina', '125 North Riverside Drive', 'Pompano Beach', 'FL', '33062', '+19547881730', 'www.sandsharbor.com', 26.23295986535422, -80.09304027373864, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Blowing Rocks Marina', '18487 SE Federal Highway', 'Tequesta', 'FL', '33469', '561-746-3312', 'www.blowingrocksmarina.com', 26.9785995, -80.0883026, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('RMK Merrill-Stevens', '881 Northwest 13th Avenue', 'Miami', 'FL', '33125', '+13053245211', 'www.rmkms.com', 25.78229627584024, -80.21518100105709, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Turnberry Marina', '19735 Turnberry Way', 'Aventura', 'FL', '33180', '305-933-6934', 'www.turnberrymarina.com', 25.95801086678256, -80.12762904618486, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Cooley''s Landing Marina', '450 SW 7th Avenue', 'Fort Lauderdale', 'FL', '33312', '(954) 828-4626', 'www.parks.fortlauderdale.gov', 26.116680975894255, -80.14958608648006, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Jupiter Yacht Club', '348 S. US 1', 'Jupiter', 'FL', '33477', '561-741-3407', 'www.jycmarina.com', 26.92998925440442, -80.07998574056366, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Allied Marine', '801 Seabreeze Blvd', 'Fort Lauderdale', 'FL', '33316', '(954) 467-8405', 'www.alliedmarine.com', 26.11341381765595, -80.10615709736553, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('River Landing', '1400-1500 NW North River Drive', 'Miami', 'FL', '33125', '+13053077705', 'www.riverlandingmiami.com', 25.78497667868528, -80.22042401797819, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('First Performance Marina', '1900 SE 15th Street', 'Fort Lauderdale', 'FL', '33316', '954-763-8743', NULL, 26.10295573005382, -80.12122579084793, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('City of Miami Marinas', '3400 Pan American Drive', 'Miami', 'FL', '33133', '305-329-4755', NULL, 25.72835438330125, -80.2341087488924, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Seahaven Marina', '301 NE 5th Avenue', 'Dania Beach', 'FL', '33004', '+19546366611', NULL, 26.05929644015193, -80.1359987778357, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Lake Park Harbor Marina', '105 Lake Shore Dr', 'Lake Park', 'FL', '33403', '(561) 881-3353', 'www.lakeparkflorida.gov', 26.79328534547213, -80.05212192531884, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Keystone Point Marina', '1950 NE 135th Street', 'North Miami', 'FL', '33181', '(305) 940-6236', 'www.keystonepointmarina.com', 25.898423011742366, -80.15868451963618, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Miami Beach Marina', '300 Alton Road', 'Miami Beach', 'FL', '33139', '305-673-6000', 'www.miamibeachmarina.com', 25.7695007, -80.1395035, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Lighthouse Point Yacht Club', '2701 NE 42 Street', 'Lighthouse Point', 'FL', '33064', '+19542638281', NULL, 26.28433591641914, -80.08329408765307, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Coral Ridge Yacht Club', '2800 Yacht Club Blvd', 'Fort Lauderdale', 'FL', '33304', '954-566-7886', 'www.coralridgeyachtclub.com', 26.1408615, -80.1087265, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Sunrise Harbor Marina', '1030 Seminole Dr', 'Fort Lauderdale', 'FL', '33304-3224', '(954) 667-6720', 'www.sunriseharbormarina.net', 26.139191702630512, -80.10939388790557, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Rybovich Marine Center', '2010 Avenue B', 'Riviera Beach', 'FL', '33404', '561-863-4126', 'www.rybovich.com', 26.7785689061527, -80.0508287731094, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Haulover Marine Center', '15600 Collins Avenue', 'North Miami', 'FL', '33154', '(305) 945-3934', 'www.haulovermarinecenter.net', 25.917023760687357, -80.12401992071808, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('TNT Marine Center', '1940 NE 135th Street', 'North Miami', 'FL', '33181', '305-947-6088', NULL, 25.89831717936056, -80.15964776034657, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Middle Point Marina', '3601 NW South River Dr', 'Miami', 'FL', '33142', '+17869535070', NULL, 25.8002548, -80.2517242, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Sailfish Marina Resort', '98 Lake Drive', 'Palm Beach Shores', 'FL', '33404', '+15618441724', 'www.sailfishmarina.com', 26.777455, -80.039668, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Sunset Harbour Yacht Club', '1928 Sunset Harbour Drive', 'Miami Beach', 'FL', '33139', '305-398-6800', 'www.sunsetharbouryc.com', 25.7947075988105, -80.14569163660538, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Untwine Marina', '300 Biscayne Boulevard Way', 'Miami', 'FL', '33131', '+17867413713', NULL, 25.77081295917776, -80.18719448580615, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Roscioli Yachting Center', '3201 W State Road 84', 'Fort Lauderdale', 'FL', '33312', '(954) 321-1250, 954-581-9200', 'www.rycshipyard.com', 26.086032275247632, -80.18695556284038, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Winston Yacht Club', '270 174th St', 'Sunny Isles Beach', 'FL', '33160', '305-932-0720', 'www.facebook.com', 25.935869316497246, -80.12862441648836, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Miamarina at Bayside', '401 Biscayne Blvd', 'Miami', 'FL', '33132', '(305) 960-5180', 'www.miamigov.com', 25.77831346468446, -80.18499357440598, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('KDM Marina, Inc.', '5225 Collins Avenue', 'Miami Beach', 'FL', '33140', '+15617889119', NULL, 25.83002349076376, -80.12242628925071, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('The Port Marina', '1801 SE 17th St', 'Fort Lauderdale', 'FL', '33316', '954-525-7678', NULL, 26.102548164487757, -80.12318867975667, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Rickenbacker Marina', '3301 Rickenbacker Cswy', 'Key Biscayne', 'FL', '33149-1016', '3053611900', 'www.rmimarina.com', 25.7467003, -80.1761017, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('The Pointe Hotel', '18701 SE Federal Hwy', 'Tequesta', 'FL', '33469', '561-283-3149', 'www.thepointehotel.com', 26.97738283138962, -80.08807472539425, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('5th Street Marina', '341 NW South River Drive', 'Miami', 'FL', '33128', '3053242040', NULL, 25.777543379649714, -80.2060076119188, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Hallandale Beach City Marina', '101 Three Islands Blvd', 'Hallandale Beach', 'FL', '33009', '+19544571653', 'www.cohb.org', 25.98828069185072, -80.12646537938157, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Prime Catch Restaurant', '700 East Woolbright Road', 'Boynton Beach', 'FL', '33435', '561.737.8822', NULL, 26.51429546487347, -80.05637501364414, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Southgate Towers Marina', '900 West Avenue', 'Miami Beach', 'FL', '33139', '+18634518774', 'www.southgatetowersmiami.com', 25.780239, -80.143484, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Lauderdale Marina', '1900 Southeast 15th St', 'Fort Lauderdale', 'FL', '33316', '(954) 523-8507', 'www.lauderdalemarina.com', 26.10348504601437, -80.12004678386451, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('17th Street Yacht Basin', '1881 SE 17th Street', 'Fort Lauderdale', 'FL', '33316', '+19545276766', NULL, 26.10189019766563, -80.12087248983724, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Eden Roc Miami Marina', '4525 Collins Ave', 'Miami Beach', 'FL', '33140', '+13054581333', NULL, 25.81985436396521, -80.12314079509395, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Waterstone Resort and Marina', '999 East Camino Real', 'Boca Raton', 'FL', '33432', '(561) 413-8281', 'www.flyingfishboca.com', 26.33940868215872, -80.07295658927082, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Port 32 Fort Lauderdale', '1915 SW 21st Ave', 'Ft. Lauderdale', 'FL', '33312', '954.895.8360', NULL, 26.097609602433565, -80.17007811458649, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('PORT 32 Palm Beach Gardens', '2385 PGA Blvd #E', 'Palm Beach Gardens', 'FL', '33410', '561.626.0200', NULL, 26.845895, -80.068119, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Williams Island Marina', '4100 Island Bl, CU#2', 'Aventura', 'FL', '33160', '+13059377813', 'www.WilliamsIslandMarina.com', 25.94029681470778, -80.13678396441998, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Hollywood Marina', '700 Polk Street', 'Hollywood', 'FL', '33019', '954.921.3035', 'www.hollywoodmarina.org', 26.0147343, -80.1187515, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Bentley Bay Marina', '520 West Ave', 'Miami Beach', 'FL', '33139', '+1 (305) 674-0686, 305-632-1242', 'www.bentleybaymarina.com', 25.77520746603409, -80.14251026775496, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Fontainebleau Marina', '4441 Collins Avenue', 'Miami Beach', 'FL', '33140', '305 538-2022', 'www.fontainebleaumarina.com', 25.817949429029, -80.12349996076769, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Marine Stadium Marina', '3501 Rickenbacker Csway', 'Key Biscayne', 'FL', '33149', '305-361-3316', 'www.miamigov.com', 25.7447920278789, -80.17236240143497, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Marina Road Boat Yard', '3000 W. State Road 84', 'Fort Lauderdale', 'FL', '33312', '954-321-1010', 'www.marinaroadboatyard.com', 26.08457870393228, -80.18317305595129, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Bayshore Landing Marina', '2550 S Bayshore Dr', 'Coconut Grove', 'FL', '33133', '+13058547997', NULL, 25.73156159998082, -80.23210806635439, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('EPIC Marina', '270 Biscayne Boulevard Way', 'Miami', 'FL', '33131', '+13054006711', 'www.epicmarina.com', 25.7702789, -80.1880569, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Hall of Fame Marina', '435 Seabreeze Blvd', 'Fort Lauderdale', 'FL', '33316', '9547643975', 'www.halloffamemarina.com', 26.11686235850867, -80.10769873141646, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Royale Palm Yacht Basin', '629 NE 3rd Street', 'Dania Beach', 'FL', '33004', '+19549235900', 'www.royalepalm.com', 26.0587566538382, -80.13297812741432, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Coconut Grove Sailing Club', '2990 South Bay Shore Drive', 'Miami', 'FL', '33133', '305-444-4571', 'www.cgsc.org', 25.725801444611406, -80.23909437080023, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Dania Cut Super Yacht Repair Facility', '760 N.E. 7th Ave', 'Fort Lauderdale', 'FL', '33004', '954-923-9545', 'www.daniacut.com', 26.060478131668262, -80.13164904612479, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('New River Downtown Docks', '450 SW 7th Ave', 'Fort Lauderdale', 'FL', '33301', '+19548285423', 'www.parks.fortlauderdale.gov', 26.1175, -80.1347222222222, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Cracker Boy Boat Works - Riviera Beach', '1124 Avenue C', 'Riviera Beach', 'FL', '33404', '561-845-0357', 'www.crackerboyboatworks.com', 26.771616066392497, -80.0511132874014, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Dockside Petroleum Services, Inc', NULL, 'Riviera Beach', 'FL', '33404', '561-882-0131', NULL, 26.77843445030892, -80.05113976408462, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Porta Bella Yacht and Tennis Club', '799 Jeffery St # 107', 'Boca Raton', 'FL', '33487', '561-997-7333', 'www.portabellayachtandtennisclub.net', 26.40408838177258, -80.06979293177565, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Gateway Marina', '8250 S Federal Hwy', 'Hypoluxo', 'FL', '33462', '561-588-1211', 'www.gatewaymarina.net', 26.55403852326218, -80.05231536280077, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Deck 84 Restaurant and Dock Bar', '840 East Atlantic Avenue', 'Delray Beach', 'FL', '33483', '561-665-8484', 'www.deck84.com', 26.461311043022604, -80.06427564675275, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Derecktor Dania', '775 Taylor Lane', 'Dania', 'FL', '33004', '+19549205756', 'www.derecktor.com', 26.0602790219865, -80.13419149628582, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Cable Marine East Yard', '301 SW 24th St', 'Fort Lauderdale', 'FL', '33315', '+19544622822', 'www.cablemarine.com', 26.10246685040855, -80.12690742264971, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Gilbane Boatworks', '19137 SE Federal Hwy # 1', 'Jupiter', 'FL', '33469', '5617442223', 'www.gilbaneboatworks.com', 26.9711429, -80.0860609, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Murrelle Marine', '846 N Dixie Hwy', 'Lantana', 'FL', '33462', '561-582-3213', NULL, 26.591820168794726, -80.04863230435768, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Marina Palms Yacht Club', '17211 Biscayne Blvd', 'North Miami Beach', 'FL', '33160', '+17867072629', NULL, 25.934707432729, -80.14983312132735, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Harbourside Place Marina', '200 N US Highway One', 'Jupiter', 'FL', '33477', '561.602.2371', NULL, 26.936197620089473, -80.08384423892026, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Square Grouper Tiki Bar and Marina', '1111 Love Street', 'Jupiter', 'FL', '33477', '561-575-0252', NULL, 26.9461, -80.08108333333334, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Palm Beach Yacht Center', '7848 S Federal Hwy', 'Hypoluxo', 'FL', '33462', '561-588-9911', 'www.palmbeachyacht.com', 26.56000114898599, -80.05157321511359, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Safe Harbor Lauderdale Marine Center', '2001 SW 20th St', 'Fort Lauderdale', 'FL', '33315-1827', '954 713-0333', 'www.lauderdalemarinecenter.com', 26.0971088, -80.166275, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Pennell''s Marine', '418 NE River Drive', 'Deerfield Beach', 'FL', '33441', '954-426-2628', 'www.pennellsmarine.net', 26.32344852564917, -80.09934709528022, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('River Cove Marina', '2000 NW North River Dr', 'Miami', 'FL', '33125', '+13055455001', 'www.rivercovemarina.com', 25.78798331813667, -80.22891150175657, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('1000 North Restaurant and Club', '1000 US-1', 'Jupiter', 'FL', '33477', '(561) 570-1000', 'www.1000north.com', 26.94635791967407, -80.08549499344305, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Mizner Marina', '790 NW 1st Ave', 'Deerfield Beach', 'FL', '33441', '954 418 0777', 'www.miznermarina.com', 26.3277460230272, -80.1033539766425, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Thunderboat Marine Service Center', '1451 Old Griffin Rd', 'Dania Beach', 'FL', '33004', '(954) 924-9444', 'www.thunderboatmarinecenter.com', 26.058654749196094, -80.15431562432063, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Port 32 Lighthouse Point', '2831 Marina Cir', 'Lighthouse Point', 'FL', '33064', '+19549410227', NULL, 26.26702301937085, -80.08339342562914, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Venetian Marina \u0026 Yacht Club', '1635 North Bayshore Dr', 'Miami', 'FL', '33132', '+17867851679', NULL, 25.79094799341573, -80.1844940431592, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Plantation Yacht Harbor', '87000 Overseas Highway', 'Islamorada', 'FL', '33036', '+13058522381', 'www.islamorada.fl.us', 24.9652256830487, -80.5684455024956, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Nautical Ventures Marine Center', '4470 Anglers Ave.', 'Dania Beach', 'FL', '33312', '954-962-8702', 'www.nauticalventures.com', 26.0672100695654, -80.1675253849295, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Quint Collection Marina', '2800 N Ocean Dr', 'Hollywood', 'FL', '33019', '1-833-784-6818', NULL, 26.029023133358834, -80.11621812038783, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Miami River Hurricane Safe Boatyard', '3250 NW N River Dr', 'Miami', 'FL', '33142', '(305) 982-8047', 'www.facebook.com', 25.799953464417257, -80.24949084136279, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('River Point Marina', '2490 NW 18th Terrace', 'Miami', 'FL', NULL, '(954) 249-2652', NULL, 25.79127926457673, -80.23770316749936, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Chamonix Marina', '3350 N.W. 21 Street', 'Miami', 'FL', '33142', '+17866358807', 'www.chamonixyachts.com', 25.79513382323235, -80.24688605992793, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Brickell Place Marina', '1865 Brickell Ave', 'Miami', 'FL', '33129', '(305) 858-7760', NULL, 25.753146133566148, -80.19595484526002, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('F3 Marina - Fort Lauderdale', '1335 Southeast 16th Street', 'Fort Lauderdale', 'FL', '33316', '+14142711111', NULL, 26.10238108244464, -80.1295061189319, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Bahia Mar Yachting Center', '801 Seabreeze Boulevard', 'Fort Lauderdale', 'FL', '33316', '954-627-6309', 'www.bahiamaryachtingcenter.com', 26.113378240919587, -80.10855063814553, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Shake-a-Leg Miami', '2620 S Bayshore Dr', 'Coconut Grove', 'FL', '33133', '+13058585550', 'www.shakealegmiami.org', 25.73115218061668, -80.23303653815671, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('The Boca Raton', '501 East Camino Real', 'Boca Raton', 'FL', '33432', '+15614473474', 'www.thebocaraton.com', 26.340984745684693, -80.0772791449551, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Safe Harbor Old Port Cove', '116 Lakeshore Drive', 'North Palm Beach', 'FL', '33408', '+15616261760', NULL, 26.83484743689965, -80.05524376043871, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Boathouse Marine Center Fuel Dock and Shipstore', '599 South Federal Highway', 'Pompano Beach', 'FL', '33062', '+19549433200', NULL, 26.22619058380785, -80.10341637239553, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Palm Beach Yacht Club \u0026 Marina', '800 N Flagler Drive', 'West Palm Beach', 'FL', '33401', '561-602-0265', 'www.pbyc.com', 26.72039335128939, -80.04811570120604, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Town of Palm Beach Marina', '500 Australian Avenue', 'Palm Beach', 'FL', '33480', '+15618385463', NULL, 26.70304263940869, -80.04555162636927, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;

INSERT INTO marinas (name, address, city, state, zip, phone, website, lat, lng, amenities, is_active, source)
VALUES ('Marina Mile Yachting Center', '2200 Marina Bay Drive East', 'Fort Lauderdale', 'FL', '33312', '9545830053', NULL, 26.0937, -80.1699, '{}', FALSE, 'csv_import')
ON CONFLICT DO NOTHING;
