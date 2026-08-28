-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 28, 2026 at 01:16 PM
-- Server version: 11.8.8-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u295735675_neela`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts_resetpassword`
--

CREATE TABLE `accounts_resetpassword` (
  `id` bigint(20) NOT NULL,
  `code` varchar(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `accounts_user`
--

CREATE TABLE `accounts_user` (
  `id` bigint(20) NOT NULL,
  `password` varchar(128) NOT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `email` varchar(254) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `is_verified` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `last_login` datetime(6) NOT NULL,
  `role` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `accounts_user`
--

INSERT INTO `accounts_user` (`id`, `password`, `is_superuser`, `is_staff`, `is_active`, `email`, `first_name`, `last_name`, `is_verified`, `date_joined`, `last_login`, `role`) VALUES
(1, 'pbkdf2_sha256$1000000$3K1sBe80QGOnuY9ky2O0IH$55musjCl0Xs83U7eRyfL61CQAxXjyRino73n7LsgF64=', 1, 1, 1, 'fadahunsipaul5@gmail.com', '', '', 0, '2026-04-01 15:29:27.415000', '2026-04-01 15:29:27.415000', 'tenant'),
(2, 'pbkdf2_sha256$1000000$ULJgFSs3XH201X2lIqoVQh$5ZbguwMCXEmVYQ94BnRlftEY6oTN9lOoEHvSuvnKsyY=', 1, 1, 1, 'neelacapital@outlook.com', 'Neela', 'Admin', 0, '2026-04-02 11:22:57.372000', '2026-04-02 11:22:57.372000', 'tenant'),
(3, 'pbkdf2_sha256$1000000$SL4cLn29m1ejx4HEdZMSyR$K3L0LgZT3LYCTvKQkFqTaAToBDVN8EO+1TZLYK+rJSg=', 0, 0, 1, 'proclaimnj@gmail.com', 'Freda', 'Williams', 1, '2026-04-02 13:12:25.034000', '2026-04-02 13:12:25.035000', 'tenant'),
(4, 'pbkdf2_sha256$1000000$srAzEGG9baoGNKWO5i6QOX$Cbib9noFK9hIyI1KYl9S4CL37fubYHmqWCco9E/x/sQ=', 0, 0, 1, 'manager@neelacapital.com', 'Will', 'Reschke', 1, '2026-06-16 17:42:06.125596', '2026-06-16 17:42:06.125638', 'property_manager'),
(5, '!2rza2zQunwsH35MeCSs6UoIc92si1wSODkS6EhtD', 0, 0, 1, 'niiahelenunoo@gmail.com', 'Nii', ' Nunoo', 0, '2026-08-25 20:35:28.396830', '2026-08-25 20:35:28.396859', 'tenant');

-- --------------------------------------------------------

--
-- Table structure for table `accounts_user_groups`
--

CREATE TABLE `accounts_user_groups` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `accounts_user_user_permissions`
--

CREATE TABLE `accounts_user_user_permissions` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `api_leasesigningtoken`
--

CREATE TABLE `api_leasesigningtoken` (
  `id` bigint(20) NOT NULL,
  `token` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `legal_document_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_leasesigningtoken`
--

INSERT INTO `api_leasesigningtoken` (`id`, `token`, `created_at`, `expires_at`, `used_at`, `legal_document_id`) VALUES
(1, '7dd983f4-5007-4c1e-b194-b1ba591a4e50', '2026-04-02 13:10:25.990000', '2026-04-09 13:10:25.990000', '2026-04-02 13:12:22.770000', 1),
(2, 'e28abaf8-9b24-48c4-bf95-2f9f6eaa5b12', '2026-08-25 20:35:49.675596', '2026-09-01 20:35:49.675362', NULL, 10);

-- --------------------------------------------------------

--
-- Table structure for table `api_leasetemplate`
--

CREATE TABLE `api_leasetemplate` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_leasetemplate`
--

INSERT INTO `api_leasetemplate` (`id`, `name`, `content`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Standard Residential Lease', 'RESIDENTIAL LEASE AGREEMENT\n\nThis Lease Agreement is entered into between:\n\nLANDLORD: {{landlord_name}}\nEmail: {{landlord_email}}\n\nTENANT: {{tenant_name}}\nEmail: {{tenant_email}}\nPhone: {{tenant_phone}}\n\nPROPERTY ADDRESS: {{property_unit}}\n\nLEASE TERMS:\n- Lease Start Date: {{lease_start}}\n- Lease End Date: {{lease_end}}\n- Monthly Rent: ${{rent_amount}}\n- Security Deposit: ${{deposit}}\n\nPAYMENT TERMS:\nRent is due on the 1st of each month. Late payments will incur fees as per local regulations.\n\nTENANT RESPONSIBILITIES:\n- Maintain the property in good condition\n- Pay rent and utilities on time\n- Follow all building rules and regulations\n- Provide notice before vacating\n\nLANDLORD RESPONSIBILITIES:\n- Maintain property in habitable condition\n- Make necessary repairs in a timely manner\n- Respect tenant\'s right to quiet enjoyment\n\nThis agreement is governed by the laws of the applicable jurisdiction.\n\nSIGNATURES:\n\n_________________________        Date: __________\nLandlord Signature\n\n_________________________        Date: __________\nTenant Signature\n', 1, '2026-04-02 13:05:58.759000', '2026-04-02 13:05:58.759000'),
(2, 'Texas Standard Residential Lease', 'STANDARD RESIDENTIAL LEASE AGREEMENT\n\nTENANT PROFILE (Pre-Filled from Application)\nFull Name: {{tenant_name}}\nEmail: {{tenant_email}}\nPhone: {{tenant_phone}}\nDate of Birth: {{date_of_birth}}\nCurrent Address: {{tenant_current_address}}\nEmployer: {{employer}}\nMonthly Income: {{monthly_income}}\nEmergency Contact: {{emergency_contact_name}} — Phone: {{emergency_contact_phone}}\nOther Occupants: {{occupants}}\n\nI. THE PARTIES. This residential lease agreement (\"Agreement\"), dated {{current_date}}, by and between:\nLANDLORD: The Landlord is an individual known as {{landlord_name}} of {{landlord_address}}, hereinafter known as the \"Landlord\", and\nTENANT(S): An individual known as {{tenant_name}}, hereinafter known as the \"Tenant(s)\", agree to the following:\n\nII. OCCUPANT(S). The Premises described in Section III is to be occupied strictly as a residential dwelling by the Tenant(s) and the following Occupants to reside on the Premises in addition to the Tenant(s) mentioned above: {{occupants}} (collectively, the \"Occupant(s)\").\n\nIII. LEASED PREMISES. The Landlord hereby rents to the Tenant(s), subject to the terms and conditions of this Agreement, a single-family home with a property and mailing address of {{property_unit}}, consisting of {{bedrooms}} bedroom(s) and {{bathrooms}} bathroom(s) (the \"Premises\"). The Landlord shall send the Tenant(s) any notices to the Premises\' aforesaid mailing address.\n\nIV. PURPOSE. The Tenant(s) and any Occupant(s) may only use the Premises as a residential dwelling. It may not be used for storage, manufacturing of any type of food or product, professional service(s), or for any commercial use, unless otherwise stated in this Agreement.\n\nV. FURNISHINGS. The Premises is not furnished.\n\nVI. APPLIANCES. The Landlord shall provide the following appliances:\nAir Conditioner Equipment, Hot Water Heater, Lighting Fixtures, Oven, Refrigerator, Smoke Detector(s), Stove, Thermostats and Controls, all of which shall be on the Premises and functional upon the move-in date of the Tenant(s) (\"Appliances and Fixtures\").\nAny damage caused to the Appliances and Fixtures from negligence, carelessness, accidents, or abuse shall be the responsibility of the Tenant(s).\n\nVII. LEASE TERM. The term of this Agreement shall be a fixed-period arrangement beginning on {{lease_start_date}} and ending on {{lease_end_date}} (\"Lease Term\"). The Tenant(s) shall have the option to continue occupying the Premises, under the same terms and conditions of this Agreement, but under an at-will, month-to-month arrangement. The Landlord or Tenant(s) shall both retain the option to terminate said month-to-month tenancy if the Landlord or Tenant(s) notifies the other party within at least thirty (30) days or the minimum notice period authorized by state law, whichever is longer. For the Tenant(s) to continue under said month-to-month tenancy at the expiration of the Lease Term, the Landlord must be notified within sixty (60) days before the end of the Lease Term.\n\nVIII. RENT. Tenant(s) shall pay the Landlord a monthly rent of {{rent_amount}} (\"Rent\"). The Rent will be due on the First (1st) of every month (\"Rent Due Date\"), and Rent shall be paid via the following instructions:\nCash, money order, Zelle, cashiers check\n\nIX. NON-SUFFICIENT FUNDS (NSF CHECKS). If the Tenant(s) attempts to pay Rent with a check, electronic transaction, or through any other means authorized by this Agreement, that fails to clear the transaction of Rent funds due to non-sufficient funds (\"NSF\"), there shall be a fee of $55.00.\n\nX. LATE FEE. If the Tenant(s) fails to pay Rent on the Rent Due Date, there shall be a late fee assessed by the Landlord in the amount of:\n$50.00 per occurrence for each Rent payment that is late after the 3rd day following the Rent Due Date.\n\nXI. FIRST (1ST) MONTH\'S RENT. First (1st) month\'s Rent payment shall be due by the Tenant(s) upon the execution of this Agreement.\n\nXII. PRE-PAYMENT. The Landlord shall not require any pre-payment of Rent by the Tenant(s).\n\nXIII. PRORATION PERIOD. The Tenant(s) will not move into the Premises before the start of the Lease Term.\n\nXIV. SECURITY DEPOSIT. A security deposit in the amount of {{deposit_amount}} shall be required from the Tenant(s) at the execution of this Agreement for the faithful performance of all its terms and conditions (\"Security Deposit\"). The Security Deposit shall be returned to the Tenant(s) within 30 days after this Agreement has terminated. The Security Deposit shall be returned in full, and in the manner prescribed by state and local laws, upon the end or termination of the Lease Term, unless the Landlord intends on imposing a claim on the Security Deposit for any damages. The Security Deposit shall not be credited towards Rent unless the Landlord gives their written consent.\n\nXV. POSSESSION. Tenant(s) shall make reasonable efforts to examine the condition of the Premises before taking possession. Once the Tenant(s) takes possession of the Premises, the Tenant(s) acknowledges the Premises is in acceptable order and consents to take possession of the Premises in its current condition unless otherwise stated herein. Failure of the Landlord to deliver possession of the Premises to the Tenant(s) at the start of the Lease Term shall terminate this Agreement at the option of the Tenant(s). Furthermore, under such failure to deliver possession by the Landlord, and if the Tenant(s) opts to cancel this Agreement, any Security Deposit required under Section XIV of this Agreement shall be returned to the Tenant(s) along with any other pre-paid Rent and fees, including any fees paid by the Tenant(s) in connection with the application process before the execution of this Agreement.\n\nXVI. OPTION TO PURCHASE. The Tenant(s) shall NOT have the right to purchase the Premises unless the Landlord and Tenant(s) agree otherwise in writing.\n\nXVII. ACCESS. Upon the start of the Proration Period or the Lease Term, whichever is earlier, the Landlord agrees to give access to the Tenant(s) in the form of keys, fobs, cards, or any type of keyless security entry device needed to enter the Premises and any designated common areas. Duplicate copies of the access forms hereof may be authorized only under the consent of the Landlord, and, if any replacements are needed, the Landlord may provide them for a reasonable fee. At the end of this Agreement, any keys, fobs, cards, or keyless entry devices provided to the Tenant(s) shall be returned to the Landlord or a fee will be billed directly to the Tenant(s) or deducted from the Security Deposit.\n\nXVIII. MOVE-IN INSPECTION. Before the Tenant(s) accepts possession as described in Section XV of this Agreement, or shortly thereafter if agreed upon, the Landlord and Tenant(s) shall not perform an inspection of the Premises.\n\nXIX. SUBLETTING. The Tenant(s) shall NOT have the right to sublet the Premises or any part thereof without the prior written consent of the Landlord. If consent is granted by the Landlord, the Tenant(s) will be responsible for all actions and liabilities of the sublessee, including but not limited to any damage to the Premises, nonpayment of Rent, and eviction procedures. In the event of an eviction, the Tenant(s) shall be responsible for all court filing fees, legal representation, and any other fees associated with removing the sublessee. The express written consent from the Landlord for one sublet agreement shall not authorize consent for any subsequent sublet agreements, and in such case, the Tenant(s) must seek consent from the Landlord for the subsequent sublet agreement.\n\nXX. ABANDONMENT. If the Tenant(s) abandons or otherwise vacates the Premises for a period equal to the minimum period set by state law or seven (7) days, whichever is less, the Landlord shall have the right to terminate this Agreement immediately and remove all personal belongings, including any personal property of the Tenant(s), from the Premises in the manner prescribed by state and local laws.\n\nXXI. ASSIGNMENT. The Tenant(s) shall NOT assign or otherwise transfer the residential lease interest described in this Agreement without first obtaining the written consent of the Landlord. Written consent from the Landlord for one assignment shall not authorize consent for any subsequent assignments, and in such case, the Tenant(s) must seek consent from the Landlord for subsequent assignments.\n\nXXII. PARKING RULES. The Landlord shall not provide parking to the Tenant(s).\n\nXXIII. RIGHT OF ENTRY. The Landlord shall have the right to enter the Premises during normal working hours by providing notice in accordance with the minimum state requirements in order to conduct inspections, make necessary repairs, alterations or improvements, supply services as previously agreed, and for any other reasonable purposes. The Landlord may exhibit the Premises to prospective purchasers, mortgagees, or lessees upon reasonable notice to the Tenant(s).\n\nXXIV. SALE OF PROPERTY. If the Premises is sold, the Tenant(s) is to be notified of the new owner and the new property manager, if any, and their contact details for repairs and maintenance shall be forwarded to the Tenant(s). If the Premises is conveyed to another party, the new owner shall have the right to terminate this Agreement.\nThe new owner shall have the right to terminate ONLY after providing at least 30 days\' notice to the Tenant(s).\n\nXXV. UTILITIES. The Landlord shall not pay for any of the utilities and services and will be the responsibility of the Tenant(s).\n\nXXVI. MAINTENANCE, REPAIRS, OR ALTERATIONS. The Tenant(s) at all times shall, at their own expense unless otherwise stated in this Agreement, maintain the Premises in a clean and sanitary manner, and shall surrender the same at termination hereof, in as good condition as received, normal wear and tear excepted. The Tenant(s) may not make any alterations to the Premises without the written consent of the Landlord. The Landlord shall be responsible for structural repairs to defects in the interior and exterior of the Premises.\nFurther, Tenant shall:\nPromptly notify Landlord of conditions at or in the Premises that are in need of repair. At all times maintain the Premises, including the appliances, furnishings, equipment, and fixtures therein, in a clean, safe, and sanitary condition. This includes maintaining appropriate climate control in order to keep the Premises clean and free of mold and mildew. Tenant shall also take necessary measures to retard and prevent mold from accumulating in the Premises. Tenant agrees to clean and dust on a regular basis and to remove visible moisture accumulation on windowsills, windows, walls, floors, ceilings, and other surfaces as soon as is reasonably possible. Tenant agrees not to block or cover any heating, ventilation, or air-conditioning ducts;\nObey all instructions, written or otherwise, of Landlord for the care and use of appliances, furnishings, equipment, and fixtures;\nUse the electric, plumbing, and other systems and facilities in a safe manner;\nUse no more electricity than the receptacles, wiring, or feeders to the Premises can safely carry;\nPay for all repairs, replacements, and damages caused by Tenant or Tenant\'s family, visitors, contractors, employees, or agents including, but not limited to, sewer and plumbing drainage problems caused by Tenant;\nPay for or perform all snow removal and lawn care at and around the Premises, unless stated otherwise in Section XXV of this Agreement;\nPromptly remove from the Property all garbage and recycling and place same in the proper receptacles;\nPromptly replace all broken glass in the Property and not damage, remove, or destroy screens installed at the Premises;\nNot engage in any activity that may cause a cancellation or an increase in the cost of Landlord\'s insurance coverage;\nKeep nothing at or in the Premises that is flammable, dangerous, or which might increase the danger of fire or other casualty;\nSurrender the Premises in good repair and broom clean condition, reasonable wear and tear excepted, at the end of the Lease Term or other termination of this Agreement;\nConsent to treatment, in the event that it becomes necessary or is deemed advisable by Landlord to use pesticides, clean, or remediate any condition in or about the Premises for the protection of Tenant, other tenants, or to protect and preserve the Premises; and\nAfter Landlord initially places fresh batteries in all battery-operated smoke detectors before Tenant moves into the Premises, replace batteries if and when needed.\n\nXXVII. EARLY TERMINATION. The Tenant(s) may not cancel this Agreement unless the Tenant(s) is a victim of domestic violence, and in such case, the Tenant(s) may be able to cancel in accordance with any local, state, or federal laws.\n\nXXVIII. PETS. The Tenant(s) shall not be allowed to have pets on the Premises or common areas except those that are necessary for individuals with disabilities.\n\nXXIX. WASTE. The Tenant(s) agrees not to commit waste on the Premises, maintain, or permit to be maintained, a nuisance thereon, or use, or permit the Premises to be used, in an unlawful manner.\n\nXXX. NOISE. The Tenant(s) agrees to abide by any and all local, county, and state noise ordinances.\n\nXXXI. GUESTS. There shall be no other persons living on the Premises other than any authorized Tenant(s) and Occupant(s). Guests of the Tenant(s) are allowed to visit and stay on the Premises for a period of no more than 7 days, unless the Landlord approves otherwise (\"Guest(s)\").\n\nXXXII. SMOKING POLICY. Smoking on the Premises is prohibited on the entire Premises, including any common areas and adjoining properties.\n\nXXXIII. COMPLIANCE WITH LAW. For the entire duration of the Lease Term, the Tenant(s) agrees to comply with any present and future laws, ordinances, orders, rules, regulations, and requirements of the federal, state, county, city, and municipal governments or any of their departments, bureaus, boards, commissions, and officials thereof with respect to the Premises, or the use or occupancy thereof, whether said compliance shall be ordered or directed to or against the Tenant(s), the Landlord, or both.\n\nXXXIV. LANDLORD\'S OBLIGATIONS. During the Lease Term of this Agreement, Landlord shall be responsible for the following: (a) ensuring the Premises is in compliance with all applicable federal, state, and local laws, regulations, statutes, and building and housing codes regarding safety, sanitation, and fair housing applicable to the Premises; (b) performing major structural repairs to the Premises, within a reasonable time after notice from Tenant. Tenant may be liable for the cost of such repairs if the damage is caused by Tenant\'s actions or the action of Tenant\'s family members, contractors, employees, visitors, or agents pursuant to this Agreement; and (c) making any necessary repairs and replacements to the vital facilities serving the Premises, including heating, plumbing, and electrical systems, within a reasonable time after notice from Tenant. Tenant may be liable for the cost of such repairs if the damage is caused by Tenant\'s actions or the action of Tenant\'s family members, contractors, employees, visitors, or agents pursuant to this Agreement. All Landlord\'s obligations are dependent upon Tenant\'s obligation to notify Landlord promptly of any conditions requiring Landlord\'s attention.\nIf Landlord fails to meet any of its above enumerated obligations, it may be possible for Tenant to terminate this Agreement and exercise other remedies under Texas Property Code Section 92.056. Tenant may also exercise other statutory remedies, including those enumerated in Texas Property Code Section 92.0561.\nLandlord is not responsible for the following: (a) damage to or loss of Tenant\'s personal property; (b) the acts of other tenants, guests, or invitees; (c) performing routine maintenance at the Property, including lawn care; or (d) any personal property of Tenant remaining in the Premises after the expiration or earlier termination of this Agreement. Such personal property shall be considered to be abandoned and Landlord can either keep such personal property or have it removed at Tenant\'s expense.\n\nXXXV. DEFAULT. If the Tenant(s) fails to comply with any of the financial, material, or miscellaneous provisions of this Agreement, or any present rules and regulations of the tenancy under this Agreement in general that may be hereafter prescribed by the Landlord, or materially fails to comply with any duties imposed on the Tenant(s) by statute, regulations, ordinances, orders, or any other mandates imposed by federal, state, and local governments, within the timeframe after delivery of a written notice to quit by the Landlord specifying noncompliance with this Agreement and indicating the intention of the Landlord to terminate the Agreement by reason thereof, the Landlord may terminate this Agreement. If the Tenant(s) fails to pay Rent upon the Rent Due Date, and the default continues for the timeframe specified in the written notice to quit thereafter, the Landlord may, at their option, declare the entire balance (compiling all months applicable to this Agreement) of Rent payable hereunder to be immediately due. The Landlord may exercise any and all rights and remedies available to the Landlord at law or in equity, and the Landlord may terminate this Agreement immediately by exercising the rights and remedies thereof.\nThe Tenant(s) shall be in default if any of the following applies: (a) Tenant(s) does not pay Rent on the Rent Due Date and after the state- or locally-mandated grace period, if any, or if the Tenant(s) fails to pay any other dues owed in accordance with respective local and state laws and this Agreement; (b) Tenant(s), Occupant(s), or any Guest(s) thereof, violate the terms and conditions of this Agreement, or any local ordinances, fire-safety or health codes, or violate any criminal laws, regardless of whether arrest or conviction occurs; (c) Tenant(s) abandons the Premises as described in Section XX of this Agreement; (d) Tenant(s) gives incorrect or false information in their rental application, if any; (e) Tenant(s), Occupant(s), or Guest(s) thereof, is arrested, convicted, or given deferred adjudication for a criminal offense involving actual or potential physical harm to a person, or involving possession, manufacture, or delivery of a controlled substance, marijuana, or drug paraphernalia under state statute; (f) any illegal drugs or paraphernalia are found in the Premises or on the person of the Tenant(s), Occupant(s), or Guest(s) thereof, while on the Premises; and (g) as otherwise allowed by local, state, and federal law.\n\nXXXVI. MULTIPLE TENANT(S) OR OCCUPANT(S). Each individual that is considered a Tenant(s) or Occupant(s) in this Agreement is jointly and individually liable for all of this Agreement\'s obligations, including but not limited to Rent monies. If any Tenant(s), Occupant(s), or guests thereof, violates this Agreement, the Tenant(s) is considered to have violated this Agreement. Landlord\'s requests and notices to the Tenant(s) or any of the Occupant(s) of legal age constitutes notice to the Tenant(s). Notices and requests from the Tenant(s), or anyone of the Occupant(s), including repair requests and entry permissions, constitutes notice from the Tenant(s). In eviction suits, the Tenant(s) is considered the agent of the Premises for the service of process.\n\nXXXVII. DISPUTES. If a dispute arises during or after the Lease Term between the Landlord and Tenant(s), they shall agree to hold negotiations amongst themselves in \"good faith\" before any litigation.\n\nXXXVIII. SEVERABILITY. If any provision of this Agreement or the application thereof shall, for any reason and to any extent, be invalid or unenforceable, neither the remainder of this Agreement, nor the application of the provision to other persons, entities, or circumstances shall be affected thereby, but instead, shall be enforced to the maximum extent permitted by law.\n\nXXXIX. SURRENDER OF PREMISES. The Tenant(s) has surrendered the Premises when (a) the move-out date has passed and no persons are living in the Premises within the Landlord\'s reasonable judgment, or (b) access to the Premises has been turned to Landlord, whichever of (a) or (b) comes first. Upon the expiration of the Lease Term, the Tenant(s) shall surrender the Premises in better or equal condition as it was at the commencement of this Agreement, albeit with reasonable use, wear- and-tear, and damages caused by the natural elements excepted.\n\nXL. RETALIATION. The Landlord is prohibited from making any type of retaliatory acts against the Tenant(s), including, but not limited to, restricting access to the Premises, decreasing or canceling Utilities and Services, failure to repair Appliances and Fixtures, or any other deliberate acts that could be considered unjustified and retaliatory against the Tenant(s).\n\nXLI. WAIVER. The Landlord\'s waiver of a breach of any covenant or duty imposed on the Tenant(s) under this Agreement shall not constitute, or be construed as, a waiver of a breach of any other covenant or duty imposed on the Tenant(s), or of any subsequent breach of the same covenant or duty. No provision, covenant, or clause of this Agreement shall be considered waived unless such a waiver is expressed in writing as a formal amendment to this Agreement and executed by the Tenant(s) and Landlord.\n\nXLII. EQUAL OPPORTUNITY. The Landlord shall make reasonable accommodations in rules, policies, practices, and services under this Agreement for Tenant(s) or Occupant(s) with a proven record of a physical or mental \"handicap\" as defined in 42 U.S.C.A. §§ 3604-3607 (\"Handicaps\"), provided such accommodations are reasonably within the Landlord\'s financial and practical means. The Landlord may issue consent to the Tenant(s) to make reasonable modifications to the Premises, at the Tenant(s) expense, to afford the Tenant(s) or any Occupant(s) with Handicaps the full enjoyment of the Premises. Any Handicaps of the Tenant(s) or Occupant(s) should be disclosed and presented to the Landlord, in writing, in order to seek the most appropriate route for providing any accommodations to the Premises. Landlord shall not discriminate against the Tenant(s) with Handicaps during the course of the Lease Term or in the rental application process. Further, the Landlord shall not discriminate against the Tenant(s) during the Lease Term or in the rental application process based on race, color, national origin, religion, sex, familial status, or any other status protected by law.\n\nXLIII. HAZARDOUS MATERIALS. The Tenant(s) agrees not to possess any type of personal property that could be considered a fire hazard on the Premises, such as a substance with highly flammable or explosive characteristics. Items prohibited from being brought into the Premises, other than for everyday cooking or those needed for operating an appliance, includes, but is not limited to, compressed gas, gasoline, fuel, propane, kerosene, motor oil, fireworks, or any other similar item or related substance in the form of a liquid, solid, or gas.\n\nXLIV. WATERBEDS. The Tenant(s) is not permitted to furnish the Premises with waterbeds.\n\nXLV. INDEMNIFICATION. The Landlord shall not be liable for any damage or injury to the Tenant(s), Occupant(s), any Guest(s), or any other persons, nor shall Landlord be liable for any damage to any property that occurs on the Premises, its common areas, or any part thereof, and the Tenant(s) agrees to hold the Landlord harmless from any claims or damages unless caused solely by the Landlord\'s negligence. It is therefore recommended Tenant(s), at their expense, purchase renter\'s insurance.\n\nXLVI. COVENANTS. The covenants and conditions herein contained shall apply to and bind the heirs, legal representatives, and assigns of the parties hereto, and all covenants are to be construed as conditions of this Agreement.\n\nXLVII. NOTICES. Any notice sent from the Landlord or the Tenant(s) to the other party shall be addressed to the underneath mailing addresses.\nLandlord\'s Mailing Address and Contact Information:\n{{landlord_name}}\n{{landlord_address}}\nPhone Number: {{landlord_phone}} Email: {{landlord_email}}\n\nTenant\'s(s\') Mailing Address:\n{{tenant_name}}\n{{property_unit}}\n\nLandlord\'s Agent / Property Manager: The Landlord does not have or otherwise authorize an agent or property manager, and all contact with regards to any repair, maintenance, or complaint must be communicated directly to the Landlord using the above-mentioned contact information.\n\nXLVIII. PREMISES DEEMED UNINHABITABLE. If the Premises is deemed uninhabitable due to damages beyond reasonable repair, the Tenant(s) shall be able to terminate this Agreement by written notice to the Landlord. If said damage was caused by negligence of the Tenant(s), Occupant(s), or their Guest(s), the Tenant(s) shall be liable to the Landlord for all pertinent repairs and for the loss of income due to restoring the Premises back to a livable condition in addition to any other losses that can be proved by the Landlord.\n\nXLIX. SERVICEMEMBERS CIVIL RELIEF ACT. In the event the Tenant(s) is currently, or hereafter becomes, a member of the United States Armed Forces on extended active duty and hereafter the Tenant(s) receives permanent change of station (PCS) orders to depart from the area where the Premises is located, or is relieved from active duty, retires or separates from the military, is ordered into military housing, or receives deployment orders, then in any of these events, the Tenant(s) may terminate this Agreement by giving thirty (30) days\' written notice to the Landlord. The Tenant(s) shall also furnish unto the Landlord a copy of the official orders, or a letter signed by the commanding officer of the Tenant(s), reflecting the change that warrants termination of this Agreement under this clause. The Tenant(s) shall pay prorated Rent for any days in which the Tenant(s) occupies the Premises past the beginning of the Lease Term. Further, any Security Deposit shall be returned, deducted, or otherwise retained in accordance with Section XIV of this Agreement.\n\nL. FAMILY VIOLENCE OR MILITARY DEPLOYMENT OR TRANSFER. In accordance with Texas law, the Tenant(s) may have special statutory rights to terminate the lease early in certain situations involving family violence or a military deployment or transfer.\n\nLI. LEAD-BASED PAINT. The Premises was not constructed before 1978 and therefore does not contain lead-based paint.\n\nLII. GOVERNING LAW. This Agreement shall be subject to and governed by the laws of the State of Texas.\n\nLIII. AGENCY RELATIONSHIP. Neither the Landlord nor the Tenant(s) utilized the services of a real estate agency or a real estate agent to negotiate, draft, or execute this Agreement.\n\nLIV. ADDITIONAL TERMS AND CONDITIONS. In addition to all the terms, conditions, covenants, and provisions of this Agreement, the Landlord and Tenant(s) agree to the following:\nLandlord not responsible for any accidents on the property.\nTenant is responsible for the mini split ac remote, if lost or broken, tenant will pay landlord $100.00 to replace.\nTenant must maintain electricity in their names at all times.\nNo parking in the back yard!!!\nBlack and green trash cans out on the street every Monday morning.\nNo unregistered or non-working vehicles on the property at anytime, will be towed at owners expense, not the landlord.\nNO PETS!!!!!!\n\nLV. ENTIRE AGREEMENT. This Agreement contains all the terms, conditions, covenants, and provisions agreed on by the Landlord, Tenant(s), and any other relevant party to this Agreement, relating to its subject matter, including any attachments or addendums. This Agreement replaces any and all previous discussions, understandings, and oral agreements. The Landlord and Tenant(s) agree to this Agreement and shall be bound until the end of the Lease Term.\n\nAMOUNT DUE AT SIGNING\nSecurity Deposit: {{deposit_amount}}\nFirst (1st) Month\'s Rent: {{rent_amount}}\n\nThe parties have agreed and duly executed this Agreement on {{current_date}}.\n\nLandlord\'s Signature: ___________________________________\n{{landlord_name}}\nDate: __________________\n\nTenant\'s Signature: ___________________________________\n{{tenant_name}}\nDate: __________________\n', 1, '2026-04-02 13:06:07.991000', '2026-04-02 13:06:07.991000'),
(3, 'Wills Lease Packet', 'LEASE APPLICATION PACKET\n\nPlease submit the attached completed lease application:\nwith a copy of all applicant\'s photo ID\'s\nproof of income\nproof of employment\nand current email addresses and phone numbers\nto:\n\nWill Reschke via:\n\nEmail: reschke_will@yahoo.com\n\nOr call @ 346-255-6143 = Will\n\nto arrange dropping all pages to the office.\nFor faster processing.\n\nThank you,\n\nWill\n346-255-6143\n\n----------------------------------------------------------------------------------\nReceived on __________________ (date) at __________________ (time)\n\nTEXAS ASSOCIATION OF REALTORS®\nRESIDENTIAL LEASE APPLICATION\n\nEach occupant and co-applicant 18 years or older must submit a separate application.\n\nProperty Address: {{property_unit}}\nAnticipated Move-in Date: {{move_in_date}}\nInitial Lease Term Requested: __________ (months)\nMonthly Rent: {{rent_amount}}\nSecurity Deposit: {{deposit_amount}}\n\nProperty Condition: Applicant is strongly encouraged to view the Property prior to submitting any application. Landlord makes no express or implied warranties as to the Property\'s condition. Applicant requests Landlord consider the following repairs or treatments should Applicant and Landlord enter into a lease:\n__________________________________________________________________________________\n\nApplicant was referred to Landlord by:\n[ ] Real estate agent __________________ (name) __________________ (phone) __________________ (e-mail)\n[ ] Newspaper  [ ] Sign  [ ] Internet  [ ] Other __________________\n\nApplicant\'s name (first, middle, last): {{tenant_name}}\nIs there a co-applicant? [ ] yes [ ] no  If yes, co-applicant must submit a separate application.\nApplicant\'s former last name (maiden or married): __________________\n\nE-mail: {{tenant_email}}\nWork Phone: __________________\nHome Phone: __________________\nMobile/Pager: {{tenant_phone}}\nSoc. Sec. No.: __________________\nDriver License No.: __________________ in ______ (state)\nDate of Birth: {{date_of_birth}}\nHeight: ______ Weight: ______\nHair Color: ______ Eye Color: ______\nMarital Status: __________________ Citizenship: ______ (country)\n\nEmergency Contact: (Do not insert the name of an occupant or co-applicant.)\nName: {{emergency_contact_name}}\nAddress: ___________________________________\nPhone: {{emergency_contact_phone}} E-mail: {{emergency_contact_email}}\n\nName all other persons who will occupy the Property:\nName: ______________________ Relationship: _______________ Age: ______\nName: ______________________ Relationship: _______________ Age: ______\nName: ______________________ Relationship: _______________ Age: ______\nName: ______________________ Relationship: _______________ Age: ______\n\nApplicant\'s Current Address:\n{{tenant_current_address}}\nApt. No. ______\n(city, state, zip)\nLandlord or Property Manager\'s Name: ___________________________________\nPhone: Day: _______________ Nt: _______________ Mb: _______________ Fax: _______________\nEmail: ___________________________________\nDate Moved-In: __________________ Move-Out Date: __________________ Rent $: __________\nReason for move: ______________________________________________________________________\n\nApplicant\'s Previous Address:\n__________________________________________________________________________________\nApt. No. ______\n(city, state, zip)\nLandlord or Property Manager\'s Name: ___________________________________\nPhone: Day: _______________ Nt: _______________ Mb: _______________ Fax: _______________\nEmail: ___________________________________\nDate Moved-In: __________________ Move-Out Date: __________________ Rent $: __________\nReason for move: ______________________________________________________________________\n\nApplicant\'s Current Employer: {{employer}}\nAddress: ______________________________________________________________________\nSupervisor\'s Name: __________________ Phone: __________________ Fax: __________________\nE-mail: __________________\nStart Date: __________________ Gross Monthly Income: {{monthly_income}} Position: {{job_title}}\n\nNote: If Applicant is self-employed, Landlord may require one or more previous year\'s tax return attested by a CPA, attorney, or other tax professional.\n\nApplicant\'s Previous Employer:\nAddress: ______________________________________________________________________\nSupervisor\'s Name: __________________ Phone: __________________ Fax: __________________\nE-mail: __________________\nEmployed from __________________ to __________________\nGross Monthly Income: $__________ Position: __________________\n\nDescribe other income Applicant wants considered: ___________________________________\n\nList all vehicles to be parked on the Property:\nType      Year      Make      Model      License Plate No./State      Mo.Pymnt.\n_______   ______    ______    ______     _______________________      __________\n_______   ______    ______    ______     _______________________      __________\n\nWill any pets (dogs, cats, birds, reptiles, fish, and other pets) be kept on the Property? [ ] yes [ ] no\nIf yes, list all pets to be kept on the Property:\nType & Breed      Name      Color     Weight    Age      Gender    Neutered?    Declawed?    Shots Current?\n______________    ______    ______    ______    ___      ______    [ ]Y [ ]N    [ ]Y [ ]N    [ ]Y [ ]N\n______________    ______    ______    ______    ___      ______    [ ]Y [ ]N    [ ]Y [ ]N    [ ]Y [ ]N\n\nWill any waterbeds or water-filled furniture be on the Property? [ ] Yes [ ] No\nDoes anyone who will occupy the Property smoke? [ ] Yes [ ] No\nWill Applicant maintain renter\'s insurance? [ ] Yes [ ] No\nIs Applicant or Applicant\'s spouse, even if separated, in military? [ ] Yes [ ] No\nIf yes, is the military person serving under orders limiting the military person\'s stay to one year or less? [ ] Yes [ ] No\n\nHas Applicant ever:\nbeen evicted? [ ] Yes [ ] No\nbeen asked to move out by a landlord? [ ] Yes [ ] No\nbreached a lease or rental agreement? [ ] Yes [ ] No\nfiled for bankruptcy? [ ] Yes [ ] No\nlost property in a foreclosure? [ ] Yes [ ] No\nhad any credit problems, including any outstanding debt (e.g., student loans or medical bills), slow-pays or delinquencies? [ ] Yes [ ] No\nbeen convicted of a crime? [ ] Yes [ ] No If yes, provide the location, year, and type of conviction below.\nIs any occupant a registered sex offender? [ ] Yes [ ] No If yes, provide the location, year, and type of conviction below.\nIs there additional information Applicant wants considered? ___________________________________\n\nAdditional comments: ______________________________________________________________________\n\nAuthorization: Applicant authorizes Landlord and Landlord\'s agent, at any time before, during, or after any tenancy, to:\n(1) obtain a copy of Applicant\'s credit report;\n(2) obtain a criminal background check related to Applicant and any occupant; and\n(3) verify any rental or employment history or verify any other information related to this application with persons knowledgeable of such information.\n\nNotice of Landlord\'s Right to Continue to Show the Property: Unless Landlord and Applicant enter into a separate written agreement otherwise, the Property remains on the market until a lease is signed by all parties and Landlord may continue to show the Property to other prospective tenants and accept another offer.\n\nPrivacy Policy: Landlord\'s agent or property manager maintains a privacy policy that is available upon request.\n\nFees: Applicant submits a non-refundable fee of $__________ to ____________________ (entity or individual) for processing and reviewing this application. Applicant [ ] submits [ ] will not submit an application deposit of $__________ to be applied to the security deposit upon execution of a lease or returned to Applicant if a lease is not executed.\n\nAcknowledgement & Representation:\n(1) Signing this application indicates that Applicant has had the opportunity to review Landlord\'s tenant selection criteria, which is available upon request. The tenant selection criteria may include factors such as criminal history, credit history, current income and rental history.\n(2) Applicant understands that providing inaccurate or incomplete information is grounds for rejection of this application and forfeiture of any application fee and may be grounds to declare Applicant in breach of any lease the Applicant may sign.\n(3) Applicant represents that the statements in this application are true and complete.\n\nApplicant\'s Signature: ___________________________________\nDate: {{current_date}}\n\nFor Landlord\'s Use:\nOn __________________ (name/initials) notified Applicant by [ ] phone [ ] mail [ ] e-mail [ ] fax [ ] in person that Applicant was [ ] approved [ ] not approved. Reason for disapproval: ___________________________________\n\n----------------------------------------------------------------------------------\n\nAUTHORIZATION TO RELEASE INFORMATION RELATED TO A RESIDENTIAL LEASE APPLICANT\n\nI, {{tenant_name}} (Applicant), have submitted an application to lease a property located at {{property_unit}} (address, city, state, zip).\n\nThe landlord, broker, or landlord\'s representative is:\nWill Reschke (name)\n___________________________________ (address)\n___________________________________ (city, state, zip)\n346-255-6143 (phone)\n___________________________________ (fax)\nreschke_will@yahoo.com (e-mail)\n\nI give my permission:\n(1) to my current and former employers to release any information about my employment history and income history to the above-named person;\n(2) to my current and former landlords to release any information about my rental history to the above-named person;\n(3) to my current and former mortgage lenders on property that I own or have owned to release any information about my mortgage payment history to the above-named person;\n(4) to my bank, savings and loan, or credit union to provide a verification of funds that I have on deposit to the above-named person; and\n(5) to the above-named person to obtain a copy of my consumer report (credit report) from any consumer reporting agency and to obtain background information about me.\n\nApplicant\'s Signature: ___________________________________\nDate: {{current_date}}\n', 1, '2026-04-02 13:06:19.104000', '2026-04-02 13:06:19.104000'),
(4, 'Texas Lease Termination Letter', 'LEASE TERMINATION LETTER\n\nDear {{tenant_name}} and all occupants,\n\nI/We, {{landlord_name}}, am your Landlord for the Property located at {{property_unit}}, {{property_city_state_zip}} and this letter represents official notice to terminate the tenancy for the lease signed on {{lease_start_date}} of which there was a Security Deposit placed in the amount of {{deposit_amount}}.\n\n{{tenant_name}} and all occupants, along with possessions, shall be required to vacate the Property by {{move_out_deadline}}.\n\nPlease respond to us by email at {{landlord_email}} or by phone at {{landlord_phone}} to obtain your new mailing address on where to send the Security Deposit. On the last day of this notice a move-out inspection shall be performed to view the condition of the Property. It is recommended that all parties involved be present to lessen the likelihood of any potential deductions to the Security Deposit.\n\nLandlord\'s Signature: ___________________________________\n{{landlord_name}}\nDate: __________________\n\n----------------------------------------------------------------------------------\n\nCertificate of Service\n\nI certify that on __________________ (date), a copy of this Termination Letter was served on {{tenant_name}} and all occupants at the indicated address by:\n\n[ ] - Delivering it personally to the person in possession.\n[ ] - Delivering it at the leased premises to a person at least 16 years old who resides in or occupies the dwelling.\n[ ] - Delivering at the leased premises by affixing the notice to vacate to the inside of the main entry door of the dwelling.\n[ ] - Both first-class mail and certified mail, return receipt requested.\n[ ] - Other: ___________________________________\n\nSignature of Deliverer: ___________________________________\nDate: __________________\n', 1, '2026-04-02 13:06:31.913000', '2026-04-02 13:06:31.913000'),
(5, 'Texas 3-Day Notice to Pay or Quit', 'EVICTION NOTICE TO PAY OR QUIT\n\nFROM:\n{{landlord_name}} (\"Landlord\")\nADDRESS:\n{{landlord_address}}\nDATE OF NOTICE:\n{{current_date}}\n\nTO:\n{{tenant_name}} and all occupants (\"Tenant\")\nPROPERTY ADDRESS:\n{{property_unit}}, {{property_city_state_zip}} (\"Rental Premises\")\n\nDear Tenant:\n\nPLEASE TAKE NOTICE that you owe the amount calculated below for PAST DUE RENT under the lease agreement entered into on {{lease_start_date}}, between you and your Landlord for the Rental Premises (the \"Lease\"). The rent owed pertains to the rental period from {{period_start_date}} to {{period_end_date}}, and the total past due rent amount is calculated as follows:\n\nRent Due: ${{rent_amount}}\nLate Fees: $__________\nOther Fees: $__________\n\nTotal Amount Due: $__________\n\nYou are hereby given 3 days\' notice to pay the total amount stated above for past due rent.\n\nPayment Instructions: Cash, Zelle, money order, cashiers check\n\nYou are required to pay the amount due within the specified notice period or surrender possession of the Rental Premises to your Landlord. If you fail to comply, your Landlord may commence a summary eviction proceeding against you to recover possession of the Rental Premises.\n\nLandlord Signature: ___________________________________\nPrint Name: {{landlord_name}}\nAddress: {{landlord_address}}\nTelephone: {{landlord_phone}}\nE-Mail: {{landlord_email}}\nDate: __________________\n\n----------------------------------------------------------------------------------\n\nAFFIDAVIT OF SERVICE\n\nCounty of Harris\nState of Texas\nDate: __________________\n\n1. SERVER. I, ___________________________________ (\"Server\"), declare under penalty of perjury that a notice for eviction was delivered and served in the following manner:\n\n2. RECIPIENT. The notice for eviction was delivered to:\n\nDefendant/Respondent:\n{{tenant_name}}\nAddress/Location:\n{{property_unit}}, {{property_city_state_zip}}\nDate: __________________ Time: ______ [ ] AM [ ] PM\n\n3. DELIVERY. The Recipient received the eviction notice by: (check one)\n\n[ ] - Mail. The Server sent the eviction notice in the mail by: (check one)\n    [ ] - Standard Mail\n    [ ] - Certified Mail (with return receipt)\n    [ ] - FedEx\n    [ ] - UPS\n    [ ] - Other __________________\n\n[ ] - Direct Service. The Server handed the eviction notice to a person identified as the Recipient.\n\n[ ] - Someone at the Residence. The Server handed the eviction notice to someone who identified as living at the residence and stated their name is: ___________________________________\n\n[ ] - Someone at the Workplace. The Server handed the eviction notice to someone who identified to be the Recipient\'s co-worker and stated their name is: ___________________________________\n\n[ ] - Leaving at the Residence. The Server left the eviction notice in the following area:\n______________________________________________________________________\n\n[ ] - Recipient Rejected Delivery. The Server delivered the eviction notice to the Recipient in-person and did not accept delivery.\n\n[ ] - Other. ______________________________________________________________________\n\n4. VERIFICATION. I declare under penalty of perjury under the laws located in this State that the foregoing is true and correct.\n\nServer Signature: ___________________________________\nPrint Name: ___________________________________\nDate: __________________\n', 1, '2026-04-02 13:06:41.837000', '2026-04-02 13:06:41.837000');

-- --------------------------------------------------------

--
-- Table structure for table `api_legaldocument`
--

CREATE TABLE `api_legaldocument` (
  `id` bigint(20) NOT NULL,
  `type` varchar(100) NOT NULL,
  `generated_content` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `status` varchar(50) NOT NULL,
  `delivery_method` varchar(50) DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `tenant_id` bigint(20) NOT NULL,
  `pdf_file` varchar(100) DEFAULT NULL,
  `signed_at` datetime(6) DEFAULT NULL,
  `signed_pdf_url` varchar(200) DEFAULT NULL,
  `signing_audit` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`signing_audit`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_legaldocument`
--

INSERT INTO `api_legaldocument` (`id`, `type`, `generated_content`, `created_at`, `status`, `delivery_method`, `tracking_number`, `tenant_id`, `pdf_file`, `signed_at`, `signed_pdf_url`, `signing_audit`) VALUES
(1, 'Lease Agreement', 'RESIDENTIAL LEASE AGREEMENT\n\nThis Lease Agreement is entered into between:\n\nLANDLORD: Neela Capital\nEmail: neelacapital@outlook.com\n\nTENANT: Freda Williams\nEmail: proclaimnj@gmail.com\nPhone: 123456789\n\nPROPERTY ADDRESS: GA on Avenue Q - Unit D\n\nLEASE TERMS:\n- Lease Start Date: 04/02/2026\n- Lease End Date: 04/02/2027\n- Monthly Rent: $$1,600.00\n- Security Deposit: $500.00\n\nPAYMENT TERMS:\nRent is due on the 1st of each month. Late payments will incur fees as per local regulations.\n\nTENANT RESPONSIBILITIES:\n- Maintain the property in good condition\n- Pay rent and utilities on time\n- Follow all building rules and regulations\n- Provide notice before vacating\n\nLANDLORD RESPONSIBILITIES:\n- Maintain property in habitable condition\n- Make necessary repairs in a timely manner\n- Respect tenant\'s right to quiet enjoyment\n\nThis agreement is governed by the laws of the applicable jurisdiction.\n\nSIGNATURES:\n\n_________________________        Date: __________\nLandlord Signature\n\n_________________________        Date: __________\nTenant Signature\n', '2026-04-02 13:10:13.220000', 'Signed', 'In-House', NULL, 1, 'media/signed_leases/signed_lease_1_20260402_131222.pdf', '2026-04-02 13:12:22.761000', NULL, '{\"ip\": \"127.0.0.1\", \"method\": \"token_link\", \"signed_at\": \"2026-04-02T13:12:22.398003+00:00\", \"tenant_id\": 1, \"user_agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\"}'),
(2, 'Lease Agreement', 'RESIDENTIAL LEASE AGREEMENT\n\nThis Lease Agreement is entered into between:\n\nLANDLORD: Neela Capital\nEmail: neelacapital@outlook.com\n\nTENANT: Freda Williams\nEmail: proclaimnj@gmail.com\nPhone: 123456789\n\nPROPERTY ADDRESS: GA on Avenue Q - Unit D\n\nLEASE TERMS:\n- Lease Start Date: 04/02/2026\n- Lease End Date: 04/02/2027\n- Monthly Rent: $$1,600.00\n- Security Deposit: $500.00\n\nPAYMENT TERMS:\nRent is due on the 1st of each month. Late payments will incur fees as per local regulations.\n\nTENANT RESPONSIBILITIES:\n- Maintain the property in good condition\n- Pay rent and utilities on time\n- Follow all building rules and regulations\n- Provide notice before vacating\n\nLANDLORD RESPONSIBILITIES:\n- Maintain property in habitable condition\n- Make necessary repairs in a timely manner\n- Respect tenant\'s right to quiet enjoyment\n\nThis agreement is governed by the laws of the applicable jurisdiction.\n\nSIGNATURES:\n\n_________________________        Date: __________\nLandlord Signature\n\n_________________________        Date: __________\nTenant Signature\n', '2026-04-02 13:11:17.052000', 'Draft', NULL, NULL, 1, 'media/leases/lease_1_20260402_131117.pdf', NULL, NULL, NULL),
(3, 'Lease Agreement', 'RESIDENTIAL LEASE AGREEMENT\n\nThis Lease Agreement is entered into between:\n\nLANDLORD: Neela Capital\nEmail: neelacapital@outlook.com\n\nTENANT: Freda Williams\nEmail: proclaimnj@gmail.com\nPhone: 123456789\n\nPROPERTY ADDRESS: GA on Avenue Q - Unit D\n\nLEASE TERMS:\n- Lease Start Date: 04/02/2026\n- Lease End Date: 04/02/2027\n- Monthly Rent: $$1,600.00\n- Security Deposit: $500.00\n\nPAYMENT TERMS:\nRent is due on the 1st of each month. Late payments will incur fees as per local regulations.\n\nTENANT RESPONSIBILITIES:\n- Maintain the property in good condition\n- Pay rent and utilities on time\n- Follow all building rules and regulations\n- Provide notice before vacating\n\nLANDLORD RESPONSIBILITIES:\n- Maintain property in habitable condition\n- Make necessary repairs in a timely manner\n- Respect tenant\'s right to quiet enjoyment\n\nThis agreement is governed by the laws of the applicable jurisdiction.\n\nSIGNATURES:\n\n_________________________        Date: __________\nLandlord Signature\n\n_________________________        Date: __________\nTenant Signature\n', '2026-04-02 13:12:57.157000', 'Draft', NULL, NULL, 1, 'media/leases/lease_1_20260402_131257.pdf', NULL, NULL, NULL),
(4, 'Notice of Late Rent', 'RENT PAYMENT BALANCE\n\nDear Freda Williams,\n\nThis is a friendly reminder that we have not received your outstanding rent balance for GA on Avenue Q - Unit D.\n\nAccount Details:\n- Tenant Name: Freda Williams\n- Property Unit: GA on Avenue Q - Unit D\n- Monthly Rent: $1600.00\n- Current Balance Due: $1100.00\n\nPlease remit payment as soon as possible to avoid late fees and potential legal action.\n\nPayment can be made via:\n- Online portal\n- Check (payable to Property Management)\n- Electronic transfer\n\nIf you have already made payment, please disregard this notice and contact our office with payment confirmation.\n\nBest regards,\nNeela Property Management Team\nDate: April 02, 2026', '2026-04-02 13:21:09.246000', 'Sent', 'Email', NULL, 1, 'media/leases/notice_1_20260402_132109_j8zipk', NULL, NULL, NULL),
(5, 'Lease Agreement', 'EVICTION NOTICE TO PAY OR QUIT\n\nFROM:\nNeela Capital (\"Landlord\")\nADDRESS:\n[Landlord Address]\nDATE OF NOTICE:\n04/02/2026\n\nTO:\nFreda Williams and all occupants (\"Tenant\")\nPROPERTY ADDRESS:\nGA on Avenue Q - Unit D, [Property City, State ZIP] (\"Rental Premises\")\n\nDear Tenant:\n\nPLEASE TAKE NOTICE that you owe the amount calculated below for PAST DUE RENT under the lease agreement entered into on 04/02/2026, between you and your Landlord for the Rental Premises (the \"Lease\"). The rent owed pertains to the rental period from 04/01/2026 to 04/30/2026, and the total past due rent amount is calculated as follows:\n\nRent Due: $$1,600.00\nLate Fees: $__________\nOther Fees: $__________\n\nTotal Amount Due: $__________\n\nYou are hereby given 3 days\' notice to pay the total amount stated above for past due rent.\n\nPayment Instructions: Cash, Zelle, money order, cashiers check\n\nYou are required to pay the amount due within the specified notice period or surrender possession of the Rental Premises to your Landlord. If you fail to comply, your Landlord may commence a summary eviction proceeding against you to recover possession of the Rental Premises.\n\nLandlord Signature: ___________________________________\nPrint Name: Neela Capital\nAddress: [Landlord Address]\nTelephone: [Landlord Phone]\nE-Mail: neelacapital@outlook.com\nDate: __________________\n\n----------------------------------------------------------------------------------\n\nAFFIDAVIT OF SERVICE\n\nCounty of Harris\nState of Texas\nDate: __________________\n\n1. SERVER. I, ___________________________________ (\"Server\"), declare under penalty of perjury that a notice for eviction was delivered and served in the following manner:\n\n2. RECIPIENT. The notice for eviction was delivered to:\n\nDefendant/Respondent:\nFreda Williams\nAddress/Location:\nGA on Avenue Q - Unit D, [Property City, State ZIP]\nDate: __________________ Time: ______ [ ] AM [ ] PM\n\n3. DELIVERY. The Recipient received the eviction notice by: (check one)\n\n[ ] - Mail. The Server sent the eviction notice in the mail by: (check one)\n    [ ] - Standard Mail\n    [ ] - Certified Mail (with return receipt)\n    [ ] - FedEx\n    [ ] - UPS\n    [ ] - Other __________________\n\n[ ] - Direct Service. The Server handed the eviction notice to a person identified as the Recipient.\n\n[ ] - Someone at the Residence. The Server handed the eviction notice to someone who identified as living at the residence and stated their name is: ___________________________________\n\n[ ] - Someone at the Workplace. The Server handed the eviction notice to someone who identified to be the Recipient\'s co-worker and stated their name is: ___________________________________\n\n[ ] - Leaving at the Residence. The Server left the eviction notice in the following area:\n______________________________________________________________________\n\n[ ] - Recipient Rejected Delivery. The Server delivered the eviction notice to the Recipient in-person and did not accept delivery.\n\n[ ] - Other. ______________________________________________________________________\n\n4. VERIFICATION. I declare under penalty of perjury under the laws located in this State that the foregoing is true and correct.\n\nServer Signature: ___________________________________\nPrint Name: ___________________________________\nDate: __________________\n', '2026-04-02 13:26:55.387000', 'Draft', NULL, NULL, 1, 'media/leases/lease_1_20260402_132655.pdf', NULL, NULL, NULL),
(6, 'Lease Agreement', 'LEASE TERMINATION LETTER\n\nDear Freda Williams and all occupants,\n\nI/We, Neela Capital, am your Landlord for the Property located at GA on Avenue Q - Unit D, [Property City, State ZIP] and this letter represents official notice to terminate the tenancy for the lease signed on 04/02/2026 of which there was a Security Deposit placed in the amount of $500.00.\n\nFreda Williams and all occupants, along with possessions, shall be required to vacate the Property by May 02, 2026.\n\nPlease respond to us by email at neelacapital@outlook.com or by phone at [Landlord Phone] to obtain your new mailing address on where to send the Security Deposit. On the last day of this notice a move-out inspection shall be performed to view the condition of the Property. It is recommended that all parties involved be present to lessen the likelihood of any potential deductions to the Security Deposit.\n\nLandlord\'s Signature: ___________________________________\nNeela Capital\nDate: __________________\n\n----------------------------------------------------------------------------------\n\nCertificate of Service\n\nI certify that on __________________ (date), a copy of this Termination Letter was served on Freda Williams and all occupants at the indicated address by:\n\n[ ] - Delivering it personally to the person in possession.\n[ ] - Delivering it at the leased premises to a person at least 16 years old who resides in or occupies the dwelling.\n[ ] - Delivering at the leased premises by affixing the notice to vacate to the inside of the main entry door of the dwelling.\n[ ] - Both first-class mail and certified mail, return receipt requested.\n[ ] - Other: ___________________________________\n\nSignature of Deliverer: ___________________________________\nDate: __________________\n', '2026-04-02 13:27:09.163000', 'Draft', NULL, NULL, 1, 'media/leases/lease_1_20260402_132709.pdf', NULL, NULL, NULL),
(7, 'Lease Agreement', 'RESIDENTIAL LEASE AGREEMENT\n\nThis Lease Agreement is entered into between:\n\nLANDLORD: Neela Capital\nEmail: neelacapital@outlook.com\n\nTENANT: Freda Williams\nEmail: proclaimnj@gmail.com\nPhone: 123456789\n\nPROPERTY ADDRESS: GA on Avenue Q - Unit D\n\nLEASE TERMS:\n- Lease Start Date: 04/02/2026\n- Lease End Date: 04/02/2027\n- Monthly Rent: $$1,600.00\n- Security Deposit: $500.00\n\nPAYMENT TERMS:\nRent is due on the 1st of each month. Late payments will incur fees as per local regulations.\n\nTENANT RESPONSIBILITIES:\n- Maintain the property in good condition\n- Pay rent and utilities on time\n- Follow all building rules and regulations\n- Provide notice before vacating\n\nLANDLORD RESPONSIBILITIES:\n- Maintain property in habitable condition\n- Make necessary repairs in a timely manner\n- Respect tenant\'s right to quiet enjoyment\n\nThis agreement is governed by the laws of the applicable jurisdiction.\n\nSIGNATURES:\n\n_________________________        Date: __________\nLandlord Signature\n\n_________________________        Date: __________\nTenant Signature\n', '2026-04-02 13:27:18.924000', 'Draft', NULL, NULL, 1, 'media/leases/lease_1_20260402_132718.pdf', NULL, NULL, NULL),
(8, '3-Day Notice to Vacate', 'EVICTION NOTICE TO PAY OR QUIT\n\nFROM:\nNeela Capital (\"Landlord\")\nADDRESS:\n[Landlord Address]\nDATE OF NOTICE:\n04/02/2026\n\nTO:\nFreda Williams and all occupants (\"Tenant\")\nPROPERTY ADDRESS:\nGA on Avenue Q - Unit D, [Property City, State ZIP] (\"Rental Premises\")\n\nDear Tenant:\n\nPLEASE TAKE NOTICE that you owe the amount calculated below for PAST DUE RENT under the lease agreement entered into on 04/02/2026, between you and your Landlord for the Rental Premises (the \"Lease\"). The rent owed pertains to the rental period from 04/01/2026 to 04/30/2026, and the total past due rent amount is calculated as follows:\n\nRent Due: $$1,600.00\nLate Fees: $__________\nOther Fees: $__________\n\nTotal Amount Due: $__________\n\nYou are hereby given 3 days\' notice to pay the total amount stated above for past due rent.\n\nPayment Instructions: Cash, Zelle, money order, cashiers check\n\nYou are required to pay the amount due within the specified notice period or surrender possession of the Rental Premises to your Landlord. If you fail to comply, your Landlord may commence a summary eviction proceeding against you to recover possession of the Rental Premises.\n\nLandlord Signature: ___________________________________\nPrint Name: Neela Capital\nAddress: [Landlord Address]\nTelephone: [Landlord Phone]\nE-Mail: neelacapital@outlook.com\nDate: __________________\n\n----------------------------------------------------------------------------------\n\nAFFIDAVIT OF SERVICE\n\nCounty of Harris\nState of Texas\nDate: __________________\n\n1. SERVER. I, ___________________________________ (\"Server\"), declare under penalty of perjury that a notice for eviction was delivered and served in the following manner:\n\n2. RECIPIENT. The notice for eviction was delivered to:\n\nDefendant/Respondent:\nFreda Williams\nAddress/Location:\nGA on Avenue Q - Unit D, [Property City, State ZIP]\nDate: __________________ Time: ______ [ ] AM [ ] PM\n\n3. DELIVERY. The Recipient received the eviction notice by: (check one)\n\n[ ] - Mail. The Server sent the eviction notice in the mail by: (check one)\n    [ ] - Standard Mail\n    [ ] - Certified Mail (with return receipt)\n    [ ] - FedEx\n    [ ] - UPS\n    [ ] - Other __________________\n\n[ ] - Direct Service. The Server handed the eviction notice to a person identified as the Recipient.\n\n[ ] - Someone at the Residence. The Server handed the eviction notice to someone who identified as living at the residence and stated their name is: ___________________________________\n\n[ ] - Someone at the Workplace. The Server handed the eviction notice to someone who identified to be the Recipient\'s co-worker and stated their name is: ___________________________________\n\n[ ] - Leaving at the Residence. The Server left the eviction notice in the following area:\n______________________________________________________________________\n\n[ ] - Recipient Rejected Delivery. The Server delivered the eviction notice to the Recipient in-person and did not accept delivery.\n\n[ ] - Other. ______________________________________________________________________\n\n4. VERIFICATION. I declare under penalty of perjury under the laws located in this State that the foregoing is true and correct.\n\nServer Signature: ___________________________________\nPrint Name: ___________________________________\nDate: __________________\n', '2026-04-02 13:27:27.683000', 'Sent', 'Certified Mail', 'PENDING-TRACKING', 1, 'media/leases/lease_1_20260402_132727.pdf', NULL, NULL, NULL),
(9, 'Notice of Late Rent', 'RENT PAYMENT BALANCE\n\nDear Freda Williams,\n\nThis is a friendly reminder that we have not received your outstanding rent balance for GA on Avenue Q - Unit D.\n\nAccount Details:\n- Tenant Name: Freda Williams\n- Property Unit: GA on Avenue Q - Unit D\n- Monthly Rent: $1600.00\n- Current Balance Due: $90.00\n\nPlease remit payment as soon as possible to avoid late fees and potential legal action.\n\nPayment can be made via:\n- Online portal\n- Check (payable to Property Management)\n- Electronic transfer\n\nIf you have already made payment, please disregard this notice and contact our office with payment confirmation.\n\nBest regards,\nNeela Property Management Team\nDate: June 08, 2026', '2026-06-08 10:17:32.029780', 'Sent', 'Email', NULL, 1, 'media/leases/notice_1_20260608_101732_rj0xel', NULL, NULL, NULL),
(10, 'Lease Agreement', 'STANDARD RESIDENTIAL LEASE AGREEMENT\n\nTENANT PROFILE (Pre-Filled from Application)\nFull Name: Nii  Nunoo\nEmail: niiahelenunoo@gmail.com\nPhone: 5073045416\nDate of Birth: 1986-03-10\nCurrent Address: 16619 saint johns wood drive, Houston, TX 77063\nEmployer: Nanik\nMonthly Income: $6,000.00\nEmergency Contact: glglglg — Phone: glglgl\nOther Occupants: Nii Ahele A Nunoo\n\nI. THE PARTIES. This residential lease agreement (\"Agreement\"), dated 08/25/2026, by and between:\nLANDLORD: The Landlord is an individual known as Neela Capital of Houston, Texas, hereinafter known as the \"Landlord\", and\nTENANT(S): An individual known as Nii  Nunoo, hereinafter known as the \"Tenant(s)\", agree to the following:\n\nII. OCCUPANT(S). The Premises described in Section III is to be occupied strictly as a residential dwelling by the Tenant(s) and the following Occupants to reside on the Premises in addition to the Tenant(s) mentioned above: Nii Ahele A Nunoo (collectively, the \"Occupant(s)\").\n\nIII. LEASED PREMISES. The Landlord hereby rents to the Tenant(s), subject to the terms and conditions of this Agreement, a single-family home with a property and mailing address of Unit 1, consisting of 3 bedroom(s) and 2 bathroom(s) (the \"Premises\"). The Landlord shall send the Tenant(s) any notices to the Premises\' aforesaid mailing address.\n\nIV. PURPOSE. The Tenant(s) and any Occupant(s) may only use the Premises as a residential dwelling. It may not be used for storage, manufacturing of any type of food or product, professional service(s), or for any commercial use, unless otherwise stated in this Agreement.\n\nV. FURNISHINGS. The Premises is not furnished.\n\nVI. APPLIANCES. The Landlord shall provide the following appliances:\nAir Conditioner Equipment, Hot Water Heater, Lighting Fixtures, Oven, Refrigerator, Smoke Detector(s), Stove, Thermostats and Controls, all of which shall be on the Premises and functional upon the move-in date of the Tenant(s) (\"Appliances and Fixtures\").\nAny damage caused to the Appliances and Fixtures from negligence, carelessness, accidents, or abuse shall be the responsibility of the Tenant(s).\n\nVII. LEASE TERM. The term of this Agreement shall be a fixed-period arrangement beginning on 08/25/2026 and ending on 08/25/2027 (\"Lease Term\"). The Tenant(s) shall have the option to continue occupying the Premises, under the same terms and conditions of this Agreement, but under an at-will, month-to-month arrangement. The Landlord or Tenant(s) shall both retain the option to terminate said month-to-month tenancy if the Landlord or Tenant(s) notifies the other party within at least thirty (30) days or the minimum notice period authorized by state law, whichever is longer. For the Tenant(s) to continue under said month-to-month tenancy at the expiration of the Lease Term, the Landlord must be notified within sixty (60) days before the end of the Lease Term.\n\nVIII. RENT. Tenant(s) shall pay the Landlord a monthly rent of $1,550.00 (\"Rent\"). The Rent will be due on the First (1st) of every month (\"Rent Due Date\"), and Rent shall be paid via the following instructions:\nCash, money order, Zelle, cashiers check\n\nIX. NON-SUFFICIENT FUNDS (NSF CHECKS). If the Tenant(s) attempts to pay Rent with a check, electronic transaction, or through any other means authorized by this Agreement, that fails to clear the transaction of Rent funds due to non-sufficient funds (\"NSF\"), there shall be a fee of $55.00.\n\nX. LATE FEE. If the Tenant(s) fails to pay Rent on the Rent Due Date, there shall be a late fee assessed by the Landlord in the amount of:\n$50.00 per occurrence for each Rent payment that is late after the 3rd day following the Rent Due Date.\n\nXI. FIRST (1ST) MONTH\'S RENT. First (1st) month\'s Rent payment shall be due by the Tenant(s) upon the execution of this Agreement.\n\nXII. PRE-PAYMENT. The Landlord shall not require any pre-payment of Rent by the Tenant(s).\n\nXIII. PRORATION PERIOD. The Tenant(s) will not move into the Premises before the start of the Lease Term.\n\nXIV. SECURITY DEPOSIT. A security deposit in the amount of $500.00 shall be required from the Tenant(s) at the execution of this Agreement for the faithful performance of all its terms and conditions (\"Security Deposit\"). The Security Deposit shall be returned to the Tenant(s) within 30 days after this Agreement has terminated. The Security Deposit shall be returned in full, and in the manner prescribed by state and local laws, upon the end or termination of the Lease Term, unless the Landlord intends on imposing a claim on the Security Deposit for any damages. The Security Deposit shall not be credited towards Rent unless the Landlord gives their written consent.\n\nXV. POSSESSION. Tenant(s) shall make reasonable efforts to examine the condition of the Premises before taking possession. Once the Tenant(s) takes possession of the Premises, the Tenant(s) acknowledges the Premises is in acceptable order and consents to take possession of the Premises in its current condition unless otherwise stated herein. Failure of the Landlord to deliver possession of the Premises to the Tenant(s) at the start of the Lease Term shall terminate this Agreement at the option of the Tenant(s). Furthermore, under such failure to deliver possession by the Landlord, and if the Tenant(s) opts to cancel this Agreement, any Security Deposit required under Section XIV of this Agreement shall be returned to the Tenant(s) along with any other pre-paid Rent and fees, including any fees paid by the Tenant(s) in connection with the application process before the execution of this Agreement.\n\nXVI. OPTION TO PURCHASE. The Tenant(s) shall NOT have the right to purchase the Premises unless the Landlord and Tenant(s) agree otherwise in writing.\n\nXVII. ACCESS. Upon the start of the Proration Period or the Lease Term, whichever is earlier, the Landlord agrees to give access to the Tenant(s) in the form of keys, fobs, cards, or any type of keyless security entry device needed to enter the Premises and any designated common areas. Duplicate copies of the access forms hereof may be authorized only under the consent of the Landlord, and, if any replacements are needed, the Landlord may provide them for a reasonable fee. At the end of this Agreement, any keys, fobs, cards, or keyless entry devices provided to the Tenant(s) shall be returned to the Landlord or a fee will be billed directly to the Tenant(s) or deducted from the Security Deposit.\n\nXVIII. MOVE-IN INSPECTION. Before the Tenant(s) accepts possession as described in Section XV of this Agreement, or shortly thereafter if agreed upon, the Landlord and Tenant(s) shall not perform an inspection of the Premises.\n\nXIX. SUBLETTING. The Tenant(s) shall NOT have the right to sublet the Premises or any part thereof without the prior written consent of the Landlord. If consent is granted by the Landlord, the Tenant(s) will be responsible for all actions and liabilities of the sublessee, including but not limited to any damage to the Premises, nonpayment of Rent, and eviction procedures. In the event of an eviction, the Tenant(s) shall be responsible for all court filing fees, legal representation, and any other fees associated with removing the sublessee. The express written consent from the Landlord for one sublet agreement shall not authorize consent for any subsequent sublet agreements, and in such case, the Tenant(s) must seek consent from the Landlord for the subsequent sublet agreement.\n\nXX. ABANDONMENT. If the Tenant(s) abandons or otherwise vacates the Premises for a period equal to the minimum period set by state law or seven (7) days, whichever is less, the Landlord shall have the right to terminate this Agreement immediately and remove all personal belongings, including any personal property of the Tenant(s), from the Premises in the manner prescribed by state and local laws.\n\nXXI. ASSIGNMENT. The Tenant(s) shall NOT assign or otherwise transfer the residential lease interest described in this Agreement without first obtaining the written consent of the Landlord. Written consent from the Landlord for one assignment shall not authorize consent for any subsequent assignments, and in such case, the Tenant(s) must seek consent from the Landlord for subsequent assignments.\n\nXXII. PARKING RULES. The Landlord shall not provide parking to the Tenant(s).\n\nXXIII. RIGHT OF ENTRY. The Landlord shall have the right to enter the Premises during normal working hours by providing notice in accordance with the minimum state requirements in order to conduct inspections, make necessary repairs, alterations or improvements, supply services as previously agreed, and for any other reasonable purposes. The Landlord may exhibit the Premises to prospective purchasers, mortgagees, or lessees upon reasonable notice to the Tenant(s).\n\nXXIV. SALE OF PROPERTY. If the Premises is sold, the Tenant(s) is to be notified of the new owner and the new property manager, if any, and their contact details for repairs and maintenance shall be forwarded to the Tenant(s). If the Premises is conveyed to another party, the new owner shall have the right to terminate this Agreement.\nThe new owner shall have the right to terminate ONLY after providing at least 30 days\' notice to the Tenant(s).\n\nXXV. UTILITIES. The Landlord shall not pay for any of the utilities and services and will be the responsibility of the Tenant(s).\n\nXXVI. MAINTENANCE, REPAIRS, OR ALTERATIONS. The Tenant(s) at all times shall, at their own expense unless otherwise stated in this Agreement, maintain the Premises in a clean and sanitary manner, and shall surrender the same at termination hereof, in as good condition as received, normal wear and tear excepted. The Tenant(s) may not make any alterations to the Premises without the written consent of the Landlord. The Landlord shall be responsible for structural repairs to defects in the interior and exterior of the Premises.\nFurther, Tenant shall:\nPromptly notify Landlord of conditions at or in the Premises that are in need of repair. At all times maintain the Premises, including the appliances, furnishings, equipment, and fixtures therein, in a clean, safe, and sanitary condition. This includes maintaining appropriate climate control in order to keep the Premises clean and free of mold and mildew. Tenant shall also take necessary measures to retard and prevent mold from accumulating in the Premises. Tenant agrees to clean and dust on a regular basis and to remove visible moisture accumulation on windowsills, windows, walls, floors, ceilings, and other surfaces as soon as is reasonably possible. Tenant agrees not to block or cover any heating, ventilation, or air-conditioning ducts;\nObey all instructions, written or otherwise, of Landlord for the care and use of appliances, furnishings, equipment, and fixtures;\nUse the electric, plumbing, and other systems and facilities in a safe manner;\nUse no more electricity than the receptacles, wiring, or feeders to the Premises can safely carry;\nPay for all repairs, replacements, and damages caused by Tenant or Tenant\'s family, visitors, contractors, employees, or agents including, but not limited to, sewer and plumbing drainage problems caused by Tenant;\nPay for or perform all snow removal and lawn care at and around the Premises, unless stated otherwise in Section XXV of this Agreement;\nPromptly remove from the Property all garbage and recycling and place same in the proper receptacles;\nPromptly replace all broken glass in the Property and not damage, remove, or destroy screens installed at the Premises;\nNot engage in any activity that may cause a cancellation or an increase in the cost of Landlord\'s insurance coverage;\nKeep nothing at or in the Premises that is flammable, dangerous, or which might increase the danger of fire or other casualty;\nSurrender the Premises in good repair and broom clean condition, reasonable wear and tear excepted, at the end of the Lease Term or other termination of this Agreement;\nConsent to treatment, in the event that it becomes necessary or is deemed advisable by Landlord to use pesticides, clean, or remediate any condition in or about the Premises for the protection of Tenant, other tenants, or to protect and preserve the Premises; and\nAfter Landlord initially places fresh batteries in all battery-operated smoke detectors before Tenant moves into the Premises, replace batteries if and when needed.\n\nXXVII. EARLY TERMINATION. The Tenant(s) may not cancel this Agreement unless the Tenant(s) is a victim of domestic violence, and in such case, the Tenant(s) may be able to cancel in accordance with any local, state, or federal laws.\n\nXXVIII. PETS. The Tenant(s) shall not be allowed to have pets on the Premises or common areas except those that are necessary for individuals with disabilities.\n\nXXIX. WASTE. The Tenant(s) agrees not to commit waste on the Premises, maintain, or permit to be maintained, a nuisance thereon, or use, or permit the Premises to be used, in an unlawful manner.\n\nXXX. NOISE. The Tenant(s) agrees to abide by any and all local, county, and state noise ordinances.\n\nXXXI. GUESTS. There shall be no other persons living on the Premises other than any authorized Tenant(s) and Occupant(s). Guests of the Tenant(s) are allowed to visit and stay on the Premises for a period of no more than 7 days, unless the Landlord approves otherwise (\"Guest(s)\").\n\nXXXII. SMOKING POLICY. Smoking on the Premises is prohibited on the entire Premises, including any common areas and adjoining properties.\n\nXXXIII. COMPLIANCE WITH LAW. For the entire duration of the Lease Term, the Tenant(s) agrees to comply with any present and future laws, ordinances, orders, rules, regulations, and requirements of the federal, state, county, city, and municipal governments or any of their departments, bureaus, boards, commissions, and officials thereof with respect to the Premises, or the use or occupancy thereof, whether said compliance shall be ordered or directed to or against the Tenant(s), the Landlord, or both.\n\nXXXIV. LANDLORD\'S OBLIGATIONS. During the Lease Term of this Agreement, Landlord shall be responsible for the following: (a) ensuring the Premises is in compliance with all applicable federal, state, and local laws, regulations, statutes, and building and housing codes regarding safety, sanitation, and fair housing applicable to the Premises; (b) performing major structural repairs to the Premises, within a reasonable time after notice from Tenant. Tenant may be liable for the cost of such repairs if the damage is caused by Tenant\'s actions or the action of Tenant\'s family members, contractors, employees, visitors, or agents pursuant to this Agreement; and (c) making any necessary repairs and replacements to the vital facilities serving the Premises, including heating, plumbing, and electrical systems, within a reasonable time after notice from Tenant. Tenant may be liable for the cost of such repairs if the damage is caused by Tenant\'s actions or the action of Tenant\'s family members, contractors, employees, visitors, or agents pursuant to this Agreement. All Landlord\'s obligations are dependent upon Tenant\'s obligation to notify Landlord promptly of any conditions requiring Landlord\'s attention.\nIf Landlord fails to meet any of its above enumerated obligations, it may be possible for Tenant to terminate this Agreement and exercise other remedies under Texas Property Code Section 92.056. Tenant may also exercise other statutory remedies, including those enumerated in Texas Property Code Section 92.0561.\nLandlord is not responsible for the following: (a) damage to or loss of Tenant\'s personal property; (b) the acts of other tenants, guests, or invitees; (c) performing routine maintenance at the Property, including lawn care; or (d) any personal property of Tenant remaining in the Premises after the expiration or earlier termination of this Agreement. Such personal property shall be considered to be abandoned and Landlord can either keep such personal property or have it removed at Tenant\'s expense.\n\nXXXV. DEFAULT. If the Tenant(s) fails to comply with any of the financial, material, or miscellaneous provisions of this Agreement, or any present rules and regulations of the tenancy under this Agreement in general that may be hereafter prescribed by the Landlord, or materially fails to comply with any duties imposed on the Tenant(s) by statute, regulations, ordinances, orders, or any other mandates imposed by federal, state, and local governments, within the timeframe after delivery of a written notice to quit by the Landlord specifying noncompliance with this Agreement and indicating the intention of the Landlord to terminate the Agreement by reason thereof, the Landlord may terminate this Agreement. If the Tenant(s) fails to pay Rent upon the Rent Due Date, and the default continues for the timeframe specified in the written notice to quit thereafter, the Landlord may, at their option, declare the entire balance (compiling all months applicable to this Agreement) of Rent payable hereunder to be immediately due. The Landlord may exercise any and all rights and remedies available to the Landlord at law or in equity, and the Landlord may terminate this Agreement immediately by exercising the rights and remedies thereof.\nThe Tenant(s) shall be in default if any of the following applies: (a) Tenant(s) does not pay Rent on the Rent Due Date and after the state- or locally-mandated grace period, if any, or if the Tenant(s) fails to pay any other dues owed in accordance with respective local and state laws and this Agreement; (b) Tenant(s), Occupant(s), or any Guest(s) thereof, violate the terms and conditions of this Agreement, or any local ordinances, fire-safety or health codes, or violate any criminal laws, regardless of whether arrest or conviction occurs; (c) Tenant(s) abandons the Premises as described in Section XX of this Agreement; (d) Tenant(s) gives incorrect or false information in their rental application, if any; (e) Tenant(s), Occupant(s), or Guest(s) thereof, is arrested, convicted, or given deferred adjudication for a criminal offense involving actual or potential physical harm to a person, or involving possession, manufacture, or delivery of a controlled substance, marijuana, or drug paraphernalia under state statute; (f) any illegal drugs or paraphernalia are found in the Premises or on the person of the Tenant(s), Occupant(s), or Guest(s) thereof, while on the Premises; and (g) as otherwise allowed by local, state, and federal law.\n\nXXXVI. MULTIPLE TENANT(S) OR OCCUPANT(S). Each individual that is considered a Tenant(s) or Occupant(s) in this Agreement is jointly and individually liable for all of this Agreement\'s obligations, including but not limited to Rent monies. If any Tenant(s), Occupant(s), or guests thereof, violates this Agreement, the Tenant(s) is considered to have violated this Agreement. Landlord\'s requests and notices to the Tenant(s) or any of the Occupant(s) of legal age constitutes notice to the Tenant(s). Notices and requests from the Tenant(s), or anyone of the Occupant(s), including repair requests and entry permissions, constitutes notice from the Tenant(s). In eviction suits, the Tenant(s) is considered the agent of the Premises for the service of process.\n\nXXXVII. DISPUTES. If a dispute arises during or after the Lease Term between the Landlord and Tenant(s), they shall agree to hold negotiations amongst themselves in \"good faith\" before any litigation.\n\nXXXVIII. SEVERABILITY. If any provision of this Agreement or the application thereof shall, for any reason and to any extent, be invalid or unenforceable, neither the remainder of this Agreement, nor the application of the provision to other persons, entities, or circumstances shall be affected thereby, but instead, shall be enforced to the maximum extent permitted by law.\n\nXXXIX. SURRENDER OF PREMISES. The Tenant(s) has surrendered the Premises when (a) the move-out date has passed and no persons are living in the Premises within the Landlord\'s reasonable judgment, or (b) access to the Premises has been turned to Landlord, whichever of (a) or (b) comes first. Upon the expiration of the Lease Term, the Tenant(s) shall surrender the Premises in better or equal condition as it was at the commencement of this Agreement, albeit with reasonable use, wear- and-tear, and damages caused by the natural elements excepted.\n\nXL. RETALIATION. The Landlord is prohibited from making any type of retaliatory acts against the Tenant(s), including, but not limited to, restricting access to the Premises, decreasing or canceling Utilities and Services, failure to repair Appliances and Fixtures, or any other deliberate acts that could be considered unjustified and retaliatory against the Tenant(s).\n\nXLI. WAIVER. The Landlord\'s waiver of a breach of any covenant or duty imposed on the Tenant(s) under this Agreement shall not constitute, or be construed as, a waiver of a breach of any other covenant or duty imposed on the Tenant(s), or of any subsequent breach of the same covenant or duty. No provision, covenant, or clause of this Agreement shall be considered waived unless such a waiver is expressed in writing as a formal amendment to this Agreement and executed by the Tenant(s) and Landlord.\n\nXLII. EQUAL OPPORTUNITY. The Landlord shall make reasonable accommodations in rules, policies, practices, and services under this Agreement for Tenant(s) or Occupant(s) with a proven record of a physical or mental \"handicap\" as defined in 42 U.S.C.A. §§ 3604-3607 (\"Handicaps\"), provided such accommodations are reasonably within the Landlord\'s financial and practical means. The Landlord may issue consent to the Tenant(s) to make reasonable modifications to the Premises, at the Tenant(s) expense, to afford the Tenant(s) or any Occupant(s) with Handicaps the full enjoyment of the Premises. Any Handicaps of the Tenant(s) or Occupant(s) should be disclosed and presented to the Landlord, in writing, in order to seek the most appropriate route for providing any accommodations to the Premises. Landlord shall not discriminate against the Tenant(s) with Handicaps during the course of the Lease Term or in the rental application process. Further, the Landlord shall not discriminate against the Tenant(s) during the Lease Term or in the rental application process based on race, color, national origin, religion, sex, familial status, or any other status protected by law.\n\nXLIII. HAZARDOUS MATERIALS. The Tenant(s) agrees not to possess any type of personal property that could be considered a fire hazard on the Premises, such as a substance with highly flammable or explosive characteristics. Items prohibited from being brought into the Premises, other than for everyday cooking or those needed for operating an appliance, includes, but is not limited to, compressed gas, gasoline, fuel, propane, kerosene, motor oil, fireworks, or any other similar item or related substance in the form of a liquid, solid, or gas.\n\nXLIV. WATERBEDS. The Tenant(s) is not permitted to furnish the Premises with waterbeds.\n\nXLV. INDEMNIFICATION. The Landlord shall not be liable for any damage or injury to the Tenant(s), Occupant(s), any Guest(s), or any other persons, nor shall Landlord be liable for any damage to any property that occurs on the Premises, its common areas, or any part thereof, and the Tenant(s) agrees to hold the Landlord harmless from any claims or damages unless caused solely by the Landlord\'s negligence. It is therefore recommended Tenant(s), at their expense, purchase renter\'s insurance.\n\nXLVI. COVENANTS. The covenants and conditions herein contained shall apply to and bind the heirs, legal representatives, and assigns of the parties hereto, and all covenants are to be construed as conditions of this Agreement.\n\nXLVII. NOTICES. Any notice sent from the Landlord or the Tenant(s) to the other party shall be addressed to the underneath mailing addresses.\nLandlord\'s Mailing Address and Contact Information:\nNeela Capital\nHouston, Texas\nPhone Number: [Landlord Phone] Email: neelacapital@outlook.com\n\nTenant\'s(s\') Mailing Address:\nNii  Nunoo\nUnit 1\n\nLandlord\'s Agent / Property Manager: The Landlord does not have or otherwise authorize an agent or property manager, and all contact with regards to any repair, maintenance, or complaint must be communicated directly to the Landlord using the above-mentioned contact information.\n\nXLVIII. PREMISES DEEMED UNINHABITABLE. If the Premises is deemed uninhabitable due to damages beyond reasonable repair, the Tenant(s) shall be able to terminate this Agreement by written notice to the Landlord. If said damage was caused by negligence of the Tenant(s), Occupant(s), or their Guest(s), the Tenant(s) shall be liable to the Landlord for all pertinent repairs and for the loss of income due to restoring the Premises back to a livable condition in addition to any other losses that can be proved by the Landlord.\n\nXLIX. SERVICEMEMBERS CIVIL RELIEF ACT. In the event the Tenant(s) is currently, or hereafter becomes, a member of the United States Armed Forces on extended active duty and hereafter the Tenant(s) receives permanent change of station (PCS) orders to depart from the area where the Premises is located, or is relieved from active duty, retires or separates from the military, is ordered into military housing, or receives deployment orders, then in any of these events, the Tenant(s) may terminate this Agreement by giving thirty (30) days\' written notice to the Landlord. The Tenant(s) shall also furnish unto the Landlord a copy of the official orders, or a letter signed by the commanding officer of the Tenant(s), reflecting the change that warrants termination of this Agreement under this clause. The Tenant(s) shall pay prorated Rent for any days in which the Tenant(s) occupies the Premises past the beginning of the Lease Term. Further, any Security Deposit shall be returned, deducted, or otherwise retained in accordance with Section XIV of this Agreement.\n\nL. FAMILY VIOLENCE OR MILITARY DEPLOYMENT OR TRANSFER. In accordance with Texas law, the Tenant(s) may have special statutory rights to terminate the lease early in certain situations involving family violence or a military deployment or transfer.\n\nLI. LEAD-BASED PAINT. The Premises was not constructed before 1978 and therefore does not contain lead-based paint.\n\nLII. GOVERNING LAW. This Agreement shall be subject to and governed by the laws of the State of Texas.\n\nLIII. AGENCY RELATIONSHIP. Neither the Landlord nor the Tenant(s) utilized the services of a real estate agency or a real estate agent to negotiate, draft, or execute this Agreement.\n\nLIV. ADDITIONAL TERMS AND CONDITIONS. In addition to all the terms, conditions, covenants, and provisions of this Agreement, the Landlord and Tenant(s) agree to the following:\nLandlord not responsible for any accidents on the property.\nTenant is responsible for the mini split ac remote, if lost or broken, tenant will pay landlord $100.00 to replace.\nTenant must maintain electricity in their names at all times.\nNo parking in the back yard!!!\nBlack and green trash cans out on the street every Monday morning.\nNo unregistered or non-working vehicles on the property at anytime, will be towed at owners expense, not the landlord.\nNO PETS!!!!!!\n\nLV. ENTIRE AGREEMENT. This Agreement contains all the terms, conditions, covenants, and provisions agreed on by the Landlord, Tenant(s), and any other relevant party to this Agreement, relating to its subject matter, including any attachments or addendums. This Agreement replaces any and all previous discussions, understandings, and oral agreements. The Landlord and Tenant(s) agree to this Agreement and shall be bound until the end of the Lease Term.\n\nAMOUNT DUE AT SIGNING\nSecurity Deposit: $500.00\nFirst (1st) Month\'s Rent: $1,550.00\n\nThe parties have agreed and duly executed this Agreement on 08/25/2026.\n\nLandlord\'s Signature: ___________________________________\nNeela Capital\nDate: __________________\n\nTenant\'s Signature: ___________________________________\nNii  Nunoo\nDate: __________________\n', '2026-08-25 20:34:53.375536', 'Sent', 'In-House', NULL, 24, 'media/leases/lease_24_20260825_203453.pdf', NULL, NULL, NULL),
(11, 'Lease Agreement', 'RESIDENTIAL LEASE AGREEMENT\n\nThis Lease Agreement is entered into between:\n\nLANDLORD: Neela Capital\nEmail: neelacapital@outlook.com\n\nTENANT: Nii  Nunoo\nEmail: niiahelenunoo@gmail.com\nPhone: 5073045416\n\nPROPERTY ADDRESS: Unit 1\n\nLEASE TERMS:\n- Lease Start Date: 08/25/2026\n- Lease End Date: 08/25/2027\n- Monthly Rent: $$1,550.00\n- Security Deposit: $500.00\n\nPAYMENT TERMS:\nRent is due on the 1st of each month. Late payments will incur fees as per local regulations.\n\nTENANT RESPONSIBILITIES:\n- Maintain the property in good condition\n- Pay rent and utilities on time\n- Follow all building rules and regulations\n- Provide notice before vacating\n\nLANDLORD RESPONSIBILITIES:\n- Maintain property in habitable condition\n- Make necessary repairs in a timely manner\n- Respect tenant\'s right to quiet enjoyment\n\nThis agreement is governed by the laws of the applicable jurisdiction.\n\nSIGNATURES:\n\n_________________________        Date: __________\nLandlord Signature\n\n_________________________        Date: __________\nTenant Signature\n', '2026-08-25 20:35:50.979752', 'Draft', NULL, NULL, 24, 'media/leases/lease_24_20260825_203551.pdf', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `api_listing`
--

CREATE TABLE `api_listing` (
  `id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `beds` int(11) NOT NULL,
  `baths` decimal(4,1) NOT NULL,
  `sqft` int(11) NOT NULL,
  `image` varchar(200) NOT NULL,
  `description` longtext NOT NULL,
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`amenities`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------


-- --------------------------------------------------------

--
-- Table structure for table `api_inquiry`
--

CREATE TABLE `api_inquiry` (
  `id` bigint(20) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `message` longtext NOT NULL,
  `source` varchar(30) NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `api_maintenancerequest`
--

CREATE TABLE `api_maintenancerequest` (
  `id` bigint(20) NOT NULL,
  `category` varchar(50) NOT NULL,
  `description` longtext NOT NULL,
  `status` varchar(50) NOT NULL,
  `priority` varchar(50) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `updates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`updates`)),
  `assigned_to` varchar(255) DEFAULT NULL,
  `completion_attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`completion_attachments`)),
  `tenant_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_maintenancerequest`
--

INSERT INTO `api_maintenancerequest` (`id`, `category`, `description`, `status`, `priority`, `created_at`, `images`, `updates`, `assigned_to`, `completion_attachments`, `tenant_id`) VALUES
(1, 'General', 'Faulty bulbs', 'Resolved', 'Medium', '2026-04-02 13:18:36.673000', '[]', '[]', NULL, '[]', 1);

-- --------------------------------------------------------

--
-- Table structure for table `api_operatingexpense`
--

CREATE TABLE `api_operatingexpense` (
  `id` bigint(20) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `notes` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `property_id` bigint(20) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `visibility` varchar(20) NOT NULL,
  `unit_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_operatingexpense`
--

INSERT INTO `api_operatingexpense` (`id`, `amount`, `category`, `date`, `notes`, `created_at`, `property_id`, `created_by_id`, `visibility`, `unit_id`) VALUES
(789, 0.00, 'maintenance', '2026-06-22', '', '2026-06-22 11:22:05.615767', 15, 4, 'operating', NULL),
(3319, 49.99, 'maintenance', '2026-06-26', 'faulty bulb repair', '2026-06-26 13:15:25.180079', 1, 4, 'operating', NULL),
(3506, 100.00, 'maintenance', '2026-06-26', 'bulb repair', '2026-06-26 14:05:30.991714', 1, 4, 'operating', NULL),
(5254, 20.00, 'maintenance', '2026-07-02', 'repair', '2026-07-02 16:41:26.331169', 20, 4, 'operating', NULL),
(5261, 100.00, 'maintenance', '2026-08-04', 'Inspection', '2026-08-04 21:38:06.852948', 20, 2, 'operating', NULL),
(5262, 100.00, 'supplies', '2026-08-04', 'Supplies & Materials', '2026-08-04 21:44:07.720015', 26, 2, 'operating', NULL),
(5263, 50.00, 'maintenance', '2026-08-04', 'Inspection · inspection · Unit: Unit A', '2026-08-04 21:44:37.006009', 18, 2, 'operating', NULL),
(5264, 200.00, 'mortgage_principal', '2026-08-04', 'Principal Repayment (non-expense) · Unit: Unit A', '2026-08-04 21:44:50.811357', 18, 2, 'admin_only', NULL),
(5882, 1293.63, 'other', '2026-01-01', 'excel-import-2026|Ave_Q|01|__SUMMARY__', '2026-08-05 13:22:13.538499', 17, NULL, 'operating', NULL),
(5883, 2556.26, 'mortgage_interest', '2026-01-01', 'excel-import-2026|Ave_Q|01|Mortgage Interest', '2026-08-05 13:22:13.789640', 17, NULL, 'admin_only', NULL),
(5884, 1424.24, 'depreciation', '2026-01-01', 'excel-import-2026|Ave_Q|01|Depreciation', '2026-08-05 13:22:14.042112', 17, NULL, 'admin_only', NULL),
(5885, 685.87, 'other', '2026-02-01', 'excel-import-2026|Ave_Q|02|__SUMMARY__', '2026-08-05 13:22:15.825142', 17, NULL, 'operating', NULL),
(5886, 2556.26, 'mortgage_interest', '2026-02-01', 'excel-import-2026|Ave_Q|02|Mortgage Interest', '2026-08-05 13:22:16.091916', 17, NULL, 'admin_only', NULL),
(5887, 1424.24, 'depreciation', '2026-02-01', 'excel-import-2026|Ave_Q|02|Depreciation', '2026-08-05 13:22:16.346139', 17, NULL, 'admin_only', NULL),
(5888, 1675.76, 'other', '2026-03-01', 'excel-import-2026|Ave_Q|03|__SUMMARY__', '2026-08-05 13:22:17.881968', 17, NULL, 'operating', NULL),
(5889, 2556.26, 'mortgage_interest', '2026-03-01', 'excel-import-2026|Ave_Q|03|Mortgage Interest', '2026-08-05 13:22:18.135655', 17, NULL, 'admin_only', NULL),
(5890, 1424.24, 'depreciation', '2026-03-01', 'excel-import-2026|Ave_Q|03|Depreciation', '2026-08-05 13:22:18.390436', 17, NULL, 'admin_only', NULL),
(5891, 1201.92, 'other', '2026-04-01', 'excel-import-2026|Ave_Q|04|__SUMMARY__', '2026-08-05 13:22:20.183892', 17, NULL, 'operating', NULL),
(5892, 2556.26, 'mortgage_interest', '2026-04-01', 'excel-import-2026|Ave_Q|04|Mortgage Interest', '2026-08-05 13:22:20.436209', 17, NULL, 'admin_only', NULL),
(5893, 1424.24, 'depreciation', '2026-04-01', 'excel-import-2026|Ave_Q|04|Depreciation', '2026-08-05 13:22:20.690837', 17, NULL, 'admin_only', NULL),
(5894, 1380.60, 'other', '2026-05-01', 'excel-import-2026|Ave_Q|05|__SUMMARY__', '2026-08-05 13:22:22.454020', 17, NULL, 'operating', NULL),
(5895, 2556.26, 'mortgage_interest', '2026-05-01', 'excel-import-2026|Ave_Q|05|Mortgage Interest', '2026-08-05 13:22:22.703307', 17, NULL, 'admin_only', NULL),
(5896, 1424.24, 'depreciation', '2026-05-01', 'excel-import-2026|Ave_Q|05|Depreciation', '2026-08-05 13:22:22.957909', 17, NULL, 'admin_only', NULL),
(5897, 30.00, 'other', '2026-06-01', 'excel-import-2026|Ave_Q|06|__SUMMARY__', '2026-08-05 13:22:24.475412', 17, NULL, 'operating', NULL),
(5898, 30.00, 'management', '2026-06-01', 'excel-import-2026|Ave_Q|06|Property Management - Unit 4', '2026-08-05 13:22:24.734144', 17, NULL, 'operating', 4),
(5899, 2556.26, 'mortgage_interest', '2026-06-01', 'excel-import-2026|Ave_Q|06|Mortgage Interest', '2026-08-05 13:22:24.984798', 17, NULL, 'admin_only', NULL),
(5900, 1424.24, 'depreciation', '2026-06-01', 'excel-import-2026|Ave_Q|06|Depreciation', '2026-08-05 13:22:25.235171', 17, NULL, 'admin_only', NULL),
(5901, 30.00, 'other', '2026-07-01', 'excel-import-2026|Ave_Q|07|__SUMMARY__', '2026-08-05 13:22:27.035693', 17, NULL, 'operating', NULL),
(5902, 30.00, 'management', '2026-07-01', 'excel-import-2026|Ave_Q|07|Property Management - Unit 4', '2026-08-05 13:22:27.294374', 17, NULL, 'operating', 4),
(5903, 2556.26, 'mortgage_interest', '2026-07-01', 'excel-import-2026|Ave_Q|07|Mortgage Interest', '2026-08-05 13:22:27.545625', 17, NULL, 'admin_only', NULL),
(5904, 1424.24, 'depreciation', '2026-07-01', 'excel-import-2026|Ave_Q|07|Depreciation', '2026-08-05 13:22:27.795764', 17, NULL, 'admin_only', NULL),
(5905, 30.00, 'other', '2026-08-01', 'excel-import-2026|Ave_Q|08|__SUMMARY__', '2026-08-05 13:22:29.313890', 17, NULL, 'operating', NULL),
(5906, 30.00, 'management', '2026-08-01', 'excel-import-2026|Ave_Q|08|Property Management - Unit 4', '2026-08-05 13:22:29.565865', 17, NULL, 'operating', 4),
(5907, 2556.26, 'mortgage_interest', '2026-08-01', 'excel-import-2026|Ave_Q|08|Mortgage Interest', '2026-08-05 13:22:29.826023', 17, NULL, 'admin_only', NULL),
(5908, 1424.24, 'depreciation', '2026-08-01', 'excel-import-2026|Ave_Q|08|Depreciation', '2026-08-05 13:22:30.076631', 17, NULL, 'admin_only', NULL),
(5909, 30.00, 'other', '2026-09-01', 'excel-import-2026|Ave_Q|09|__SUMMARY__', '2026-08-05 13:22:31.598933', 17, NULL, 'operating', NULL),
(5910, 30.00, 'management', '2026-09-01', 'excel-import-2026|Ave_Q|09|Property Management - Unit 4', '2026-08-05 13:22:31.856780', 17, NULL, 'operating', 4),
(5911, 2556.26, 'mortgage_interest', '2026-09-01', 'excel-import-2026|Ave_Q|09|Mortgage Interest', '2026-08-05 13:22:32.116555', 17, NULL, 'admin_only', NULL),
(5912, 1424.24, 'depreciation', '2026-09-01', 'excel-import-2026|Ave_Q|09|Depreciation', '2026-08-05 13:22:32.368537', 17, NULL, 'admin_only', NULL),
(5913, 30.00, 'other', '2026-10-01', 'excel-import-2026|Ave_Q|10|__SUMMARY__', '2026-08-05 13:22:34.017649', 17, NULL, 'operating', NULL),
(5914, 30.00, 'management', '2026-10-01', 'excel-import-2026|Ave_Q|10|Property Management - Unit 4', '2026-08-05 13:22:34.267266', 17, NULL, 'operating', 4),
(5915, 2556.26, 'mortgage_interest', '2026-10-01', 'excel-import-2026|Ave_Q|10|Mortgage Interest', '2026-08-05 13:22:34.522406', 17, NULL, 'admin_only', NULL),
(5916, 1424.24, 'depreciation', '2026-10-01', 'excel-import-2026|Ave_Q|10|Depreciation', '2026-08-05 13:22:34.795056', 17, NULL, 'admin_only', NULL),
(5917, 30.00, 'other', '2026-11-01', 'excel-import-2026|Ave_Q|11|__SUMMARY__', '2026-08-05 13:22:36.377492', 17, NULL, 'operating', NULL),
(5918, 30.00, 'management', '2026-11-01', 'excel-import-2026|Ave_Q|11|Property Management - Unit 4', '2026-08-05 13:22:36.627051', 17, NULL, 'operating', 4),
(5919, 2556.26, 'mortgage_interest', '2026-11-01', 'excel-import-2026|Ave_Q|11|Mortgage Interest', '2026-08-05 13:22:36.892273', 17, NULL, 'admin_only', NULL),
(5920, 1424.24, 'depreciation', '2026-11-01', 'excel-import-2026|Ave_Q|11|Depreciation', '2026-08-05 13:22:37.145126', 17, NULL, 'admin_only', NULL),
(5921, 30.00, 'other', '2026-12-01', 'excel-import-2026|Ave_Q|12|__SUMMARY__', '2026-08-05 13:22:38.674105', 17, NULL, 'operating', NULL),
(5922, 30.00, 'management', '2026-12-01', 'excel-import-2026|Ave_Q|12|Property Management - Unit 4', '2026-08-05 13:22:38.926175', 17, NULL, 'operating', 4),
(5923, 2556.26, 'mortgage_interest', '2026-12-01', 'excel-import-2026|Ave_Q|12|Mortgage Interest', '2026-08-05 13:22:39.174992', 17, NULL, 'admin_only', NULL),
(5924, 1424.24, 'depreciation', '2026-12-01', 'excel-import-2026|Ave_Q|12|Depreciation', '2026-08-05 13:22:39.423606', 17, NULL, 'admin_only', NULL),
(5925, 468.53, 'other', '2026-01-01', 'excel-import-2026|Bella_Jess|01|__SUMMARY__', '2026-08-05 13:22:42.985115', 22, NULL, 'operating', NULL),
(5926, 303.38, 'utilities', '2026-01-01', 'excel-import-2026|Bella_Jess|01|Electricity', '2026-08-05 13:22:43.237568', 22, NULL, 'operating', NULL),
(5927, 165.15, 'utilities', '2026-01-01', 'excel-import-2026|Bella_Jess|01|Utilities (Landlord Paid)', '2026-08-05 13:22:43.492062', 22, NULL, 'operating', NULL),
(5928, 411.23, 'other', '2026-02-01', 'excel-import-2026|Bella_Jess|02|__SUMMARY__', '2026-08-05 13:22:43.996602', 22, NULL, 'operating', NULL),
(5929, 246.08, 'utilities', '2026-02-01', 'excel-import-2026|Bella_Jess|02|Electricity', '2026-08-05 13:22:44.254400', 22, NULL, 'operating', NULL),
(5930, 165.15, 'utilities', '2026-02-01', 'excel-import-2026|Bella_Jess|02|Utilities (Landlord Paid)', '2026-08-05 13:22:44.507389', 22, NULL, 'operating', NULL),
(5931, 380.50, 'other', '2026-03-01', 'excel-import-2026|Bella_Jess|03|__SUMMARY__', '2026-08-05 13:22:45.012845', 22, NULL, 'operating', NULL),
(5932, 215.35, 'utilities', '2026-03-01', 'excel-import-2026|Bella_Jess|03|Electricity', '2026-08-05 13:22:45.272698', 22, NULL, 'operating', NULL),
(5933, 165.15, 'utilities', '2026-03-01', 'excel-import-2026|Bella_Jess|03|Utilities (Landlord Paid)', '2026-08-05 13:22:45.533957', 22, NULL, 'operating', NULL),
(5934, 748.06, 'other', '2026-04-01', 'excel-import-2026|Bella_Jess|04|__SUMMARY__', '2026-08-05 13:22:46.039178', 22, NULL, 'operating', NULL),
(5935, 350.00, 'maintenance', '2026-04-01', 'excel-import-2026|Bella_Jess|04|Repairs & Maintenance', '2026-08-05 13:22:46.292511', 22, NULL, 'operating', NULL),
(5936, 232.91, 'utilities', '2026-04-01', 'excel-import-2026|Bella_Jess|04|Electricity', '2026-08-05 13:22:46.545710', 22, NULL, 'operating', NULL),
(5937, 165.15, 'utilities', '2026-04-01', 'excel-import-2026|Bella_Jess|04|Utilities (Landlord Paid)', '2026-08-05 13:22:46.809564', 22, NULL, 'operating', NULL),
(5938, 7773.17, 'other', '2026-05-01', 'excel-import-2026|Bella_Jess|05|__SUMMARY__', '2026-08-05 13:22:47.318440', 22, NULL, 'operating', NULL),
(5939, 100.00, 'management', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Property Management Fees', '2026-08-05 13:22:47.568156', 22, NULL, 'operating', NULL),
(5940, 200.00, 'maintenance', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Repairs & Maintenance', '2026-08-05 13:22:47.817959', 22, NULL, 'operating', NULL),
(5941, 453.67, 'taxes', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Property Taxes', '2026-08-05 13:22:48.069992', 22, NULL, 'operating', NULL),
(5942, 183.83, 'insurance', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Insurance', '2026-08-05 13:22:48.317974', 22, NULL, 'operating', NULL),
(5943, 600.00, 'maintenance', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Inspection', '2026-08-05 13:22:48.572871', 22, NULL, 'operating', NULL),
(5944, 825.00, 'maintenance', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Appraisal', '2026-08-05 13:22:48.822382', 22, NULL, 'operating', NULL),
(5945, 37.50, 'hoa', '2026-05-01', 'excel-import-2026|Bella_Jess|05|HOA Fees', '2026-08-05 13:22:49.077272', 22, NULL, 'operating', NULL),
(5946, 242.27, 'transportation', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Transportation Cost', '2026-08-05 13:22:49.330194', 22, NULL, 'operating', NULL),
(5947, 350.00, 'legal', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Legal & Professional Fees', '2026-08-05 13:22:49.582536', 22, NULL, 'operating', NULL),
(5948, 4500.00, 'supplies', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Supplies & Materials', '2026-08-05 13:22:49.835029', 22, NULL, 'operating', NULL),
(5949, 241.63, 'utilities', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Electricity', '2026-08-05 13:22:50.102601', 22, NULL, 'operating', NULL),
(5950, 241.63, 'utilities', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Utilities (Landlord Paid)', '2026-08-05 13:22:50.356435', 22, NULL, 'operating', NULL),
(5951, 1232.50, 'mortgage_interest', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Mortgage Interest', '2026-08-05 13:22:50.610996', 22, NULL, 'admin_only', NULL),
(5952, 622.73, 'depreciation', '2026-05-01', 'excel-import-2026|Bella_Jess|05|Depreciation', '2026-08-05 13:22:50.865387', 22, NULL, 'admin_only', NULL),
(5953, 2401.27, 'other', '2026-06-01', 'excel-import-2026|Bella_Jess|06|__SUMMARY__', '2026-08-05 13:22:51.382291', 22, NULL, 'operating', NULL),
(5954, 100.00, 'management', '2026-06-01', 'excel-import-2026|Bella_Jess|06|Property Management Fees', '2026-08-05 13:22:51.632750', 22, NULL, 'operating', NULL),
(5955, 453.67, 'taxes', '2026-06-01', 'excel-import-2026|Bella_Jess|06|Property Taxes', '2026-08-05 13:22:51.885286', 22, NULL, 'operating', NULL),
(5956, 183.83, 'insurance', '2026-06-01', 'excel-import-2026|Bella_Jess|06|Insurance', '2026-08-05 13:22:52.136029', 22, NULL, 'operating', NULL),
(5957, 37.50, 'hoa', '2026-06-01', 'excel-import-2026|Bella_Jess|06|HOA Fees', '2026-08-05 13:22:52.390182', 22, NULL, 'operating', NULL),
(5958, 1000.00, 'advertising', '2026-06-01', 'excel-import-2026|Bella_Jess|06|Advertising / Leasing', '2026-08-05 13:22:52.661572', 22, NULL, 'operating', NULL),
(5959, 90.85, 'transportation', '2026-06-01', 'excel-import-2026|Bella_Jess|06|Transportation Cost', '2026-08-05 13:22:52.916425', 22, NULL, 'operating', NULL),
(5960, 200.00, 'supplies', '2026-06-01', 'excel-import-2026|Bella_Jess|06|Supplies & Materials', '2026-08-05 13:22:53.171418', 22, NULL, 'operating', NULL),
(5961, 306.15, 'utilities', '2026-06-01', 'excel-import-2026|Bella_Jess|06|Electricity', '2026-08-05 13:22:53.425694', 22, NULL, 'operating', NULL),
(5962, 306.15, 'utilities', '2026-06-01', 'excel-import-2026|Bella_Jess|06|Utilities (Landlord Paid)', '2026-08-05 13:22:53.678265', 22, NULL, 'operating', NULL),
(5963, 1232.50, 'mortgage_interest', '2026-06-01', 'excel-import-2026|Bella_Jess|06|Mortgage Interest', '2026-08-05 13:22:53.939493', 22, NULL, 'admin_only', NULL),
(5964, 622.73, 'depreciation', '2026-06-01', 'excel-import-2026|Bella_Jess|06|Depreciation', '2026-08-05 13:22:54.191257', 22, NULL, 'admin_only', NULL),
(5965, 1315.85, 'other', '2026-07-01', 'excel-import-2026|Bella_Jess|07|__SUMMARY__', '2026-08-05 13:22:54.694324', 22, NULL, 'operating', NULL),
(5966, 100.00, 'management', '2026-07-01', 'excel-import-2026|Bella_Jess|07|Property Management Fees', '2026-08-05 13:22:54.944013', 22, NULL, 'operating', NULL),
(5967, 453.67, 'taxes', '2026-07-01', 'excel-import-2026|Bella_Jess|07|Property Taxes', '2026-08-05 13:22:55.219044', 22, NULL, 'operating', NULL),
(5968, 183.83, 'insurance', '2026-07-01', 'excel-import-2026|Bella_Jess|07|Insurance', '2026-08-05 13:22:55.472462', 22, NULL, 'operating', NULL),
(5969, 37.50, 'hoa', '2026-07-01', 'excel-import-2026|Bella_Jess|07|HOA Fees', '2026-08-05 13:22:55.723555', 22, NULL, 'operating', NULL),
(5970, 250.00, 'advertising', '2026-07-01', 'excel-import-2026|Bella_Jess|07|Advertising / Leasing', '2026-08-05 13:22:55.979642', 22, NULL, 'operating', NULL),
(5971, 90.85, 'transportation', '2026-07-01', 'excel-import-2026|Bella_Jess|07|Transportation Cost', '2026-08-05 13:22:56.230460', 22, NULL, 'operating', NULL),
(5972, 200.00, 'supplies', '2026-07-01', 'excel-import-2026|Bella_Jess|07|Supplies & Materials', '2026-08-05 13:22:56.499338', 22, NULL, 'operating', NULL),
(5973, 1232.50, 'mortgage_interest', '2026-07-01', 'excel-import-2026|Bella_Jess|07|Mortgage Interest', '2026-08-05 13:22:56.753267', 22, NULL, 'admin_only', NULL),
(5974, 622.73, 'depreciation', '2026-07-01', 'excel-import-2026|Bella_Jess|07|Depreciation', '2026-08-05 13:22:57.006228', 22, NULL, 'admin_only', NULL),
(5975, 1467.27, 'other', '2026-08-01', 'excel-import-2026|Bella_Jess|08|__SUMMARY__', '2026-08-05 13:22:57.505995', 22, NULL, 'operating', NULL),
(5976, 100.00, 'management', '2026-08-01', 'excel-import-2026|Bella_Jess|08|Property Management Fees', '2026-08-05 13:22:57.759712', 22, NULL, 'operating', NULL),
(5977, 453.67, 'taxes', '2026-08-01', 'excel-import-2026|Bella_Jess|08|Property Taxes', '2026-08-05 13:22:58.014291', 22, NULL, 'operating', NULL),
(5978, 183.83, 'insurance', '2026-08-01', 'excel-import-2026|Bella_Jess|08|Insurance', '2026-08-05 13:22:58.268285', 22, NULL, 'operating', NULL),
(5979, 37.50, 'hoa', '2026-08-01', 'excel-import-2026|Bella_Jess|08|HOA Fees', '2026-08-05 13:22:58.515978', 22, NULL, 'operating', NULL),
(5980, 250.00, 'advertising', '2026-08-01', 'excel-import-2026|Bella_Jess|08|Advertising / Leasing', '2026-08-05 13:22:58.778514', 22, NULL, 'operating', NULL),
(5981, 242.27, 'transportation', '2026-08-01', 'excel-import-2026|Bella_Jess|08|Transportation Cost', '2026-08-05 13:22:59.030137', 22, NULL, 'operating', NULL),
(5982, 200.00, 'supplies', '2026-08-01', 'excel-import-2026|Bella_Jess|08|Supplies & Materials', '2026-08-05 13:22:59.286799', 22, NULL, 'operating', NULL),
(5983, 1232.50, 'mortgage_interest', '2026-08-01', 'excel-import-2026|Bella_Jess|08|Mortgage Interest', '2026-08-05 13:22:59.537455', 22, NULL, 'admin_only', NULL),
(5984, 622.73, 'depreciation', '2026-08-01', 'excel-import-2026|Bella_Jess|08|Depreciation', '2026-08-05 13:22:59.791031', 22, NULL, 'admin_only', NULL),
(5985, 1467.27, 'other', '2026-09-01', 'excel-import-2026|Bella_Jess|09|__SUMMARY__', '2026-08-05 13:23:00.292589', 22, NULL, 'operating', NULL),
(5986, 100.00, 'management', '2026-09-01', 'excel-import-2026|Bella_Jess|09|Property Management Fees', '2026-08-05 13:23:00.545707', 22, NULL, 'operating', NULL),
(5987, 453.67, 'taxes', '2026-09-01', 'excel-import-2026|Bella_Jess|09|Property Taxes', '2026-08-05 13:23:00.795781', 22, NULL, 'operating', NULL),
(5988, 183.83, 'insurance', '2026-09-01', 'excel-import-2026|Bella_Jess|09|Insurance', '2026-08-05 13:23:01.043825', 22, NULL, 'operating', NULL),
(5989, 37.50, 'hoa', '2026-09-01', 'excel-import-2026|Bella_Jess|09|HOA Fees', '2026-08-05 13:23:01.304878', 22, NULL, 'operating', NULL),
(5990, 250.00, 'advertising', '2026-09-01', 'excel-import-2026|Bella_Jess|09|Advertising / Leasing', '2026-08-05 13:23:01.567932', 22, NULL, 'operating', NULL),
(5991, 242.27, 'transportation', '2026-09-01', 'excel-import-2026|Bella_Jess|09|Transportation Cost', '2026-08-05 13:23:01.828046', 22, NULL, 'operating', NULL),
(5992, 200.00, 'supplies', '2026-09-01', 'excel-import-2026|Bella_Jess|09|Supplies & Materials', '2026-08-05 13:23:02.085994', 22, NULL, 'operating', NULL),
(5993, 1232.50, 'mortgage_interest', '2026-09-01', 'excel-import-2026|Bella_Jess|09|Mortgage Interest', '2026-08-05 13:23:02.337020', 22, NULL, 'admin_only', NULL),
(5994, 622.73, 'depreciation', '2026-09-01', 'excel-import-2026|Bella_Jess|09|Depreciation', '2026-08-05 13:23:02.587205', 22, NULL, 'admin_only', NULL),
(5995, 1867.27, 'other', '2026-10-01', 'excel-import-2026|Bella_Jess|10|__SUMMARY__', '2026-08-05 13:23:03.083501', 22, NULL, 'operating', NULL),
(5996, 100.00, 'management', '2026-10-01', 'excel-import-2026|Bella_Jess|10|Property Management Fees', '2026-08-05 13:23:03.333902', 22, NULL, 'operating', NULL),
(5997, 500.00, 'maintenance', '2026-10-01', 'excel-import-2026|Bella_Jess|10|Repairs & Maintenance', '2026-08-05 13:23:03.583163', 22, NULL, 'operating', NULL),
(5998, 453.67, 'taxes', '2026-10-01', 'excel-import-2026|Bella_Jess|10|Property Taxes', '2026-08-05 13:23:03.835432', 22, NULL, 'operating', NULL),
(5999, 183.83, 'insurance', '2026-10-01', 'excel-import-2026|Bella_Jess|10|Insurance', '2026-08-05 13:23:04.096519', 22, NULL, 'operating', NULL),
(6000, 37.50, 'hoa', '2026-10-01', 'excel-import-2026|Bella_Jess|10|HOA Fees', '2026-08-05 13:23:04.352112', 22, NULL, 'operating', NULL),
(6001, 150.00, 'advertising', '2026-10-01', 'excel-import-2026|Bella_Jess|10|Advertising / Leasing', '2026-08-05 13:23:04.604095', 22, NULL, 'operating', NULL),
(6002, 242.27, 'transportation', '2026-10-01', 'excel-import-2026|Bella_Jess|10|Transportation Cost', '2026-08-05 13:23:04.851487', 22, NULL, 'operating', NULL),
(6003, 200.00, 'supplies', '2026-10-01', 'excel-import-2026|Bella_Jess|10|Supplies & Materials', '2026-08-05 13:23:05.105848', 22, NULL, 'operating', NULL),
(6004, 1232.50, 'mortgage_interest', '2026-10-01', 'excel-import-2026|Bella_Jess|10|Mortgage Interest', '2026-08-05 13:23:05.371187', 22, NULL, 'admin_only', NULL),
(6005, 622.73, 'depreciation', '2026-10-01', 'excel-import-2026|Bella_Jess|10|Depreciation', '2026-08-05 13:23:05.620238', 22, NULL, 'admin_only', NULL),
(6006, 1967.27, 'other', '2026-11-01', 'excel-import-2026|Bella_Jess|11|__SUMMARY__', '2026-08-05 13:23:06.127838', 22, NULL, 'operating', NULL),
(6007, 100.00, 'management', '2026-11-01', 'excel-import-2026|Bella_Jess|11|Property Management Fees', '2026-08-05 13:23:06.375870', 22, NULL, 'operating', NULL),
(6008, 650.00, 'maintenance', '2026-11-01', 'excel-import-2026|Bella_Jess|11|Repairs & Maintenance', '2026-08-05 13:23:06.622798', 22, NULL, 'operating', NULL),
(6009, 453.67, 'taxes', '2026-11-01', 'excel-import-2026|Bella_Jess|11|Property Taxes', '2026-08-05 13:23:06.872530', 22, NULL, 'operating', NULL),
(6010, 183.83, 'insurance', '2026-11-01', 'excel-import-2026|Bella_Jess|11|Insurance', '2026-08-05 13:23:07.122221', 22, NULL, 'operating', NULL),
(6011, 37.50, 'hoa', '2026-11-01', 'excel-import-2026|Bella_Jess|11|HOA Fees', '2026-08-05 13:23:07.372176', 22, NULL, 'operating', NULL),
(6012, 150.00, 'advertising', '2026-11-01', 'excel-import-2026|Bella_Jess|11|Advertising / Leasing', '2026-08-05 13:23:07.624916', 22, NULL, 'operating', NULL),
(6013, 242.27, 'transportation', '2026-11-01', 'excel-import-2026|Bella_Jess|11|Transportation Cost', '2026-08-05 13:23:07.873291', 22, NULL, 'operating', NULL),
(6014, 150.00, 'supplies', '2026-11-01', 'excel-import-2026|Bella_Jess|11|Supplies & Materials', '2026-08-05 13:23:08.121234', 22, NULL, 'operating', NULL),
(6015, 1232.50, 'mortgage_interest', '2026-11-01', 'excel-import-2026|Bella_Jess|11|Mortgage Interest', '2026-08-05 13:23:08.373418', 22, NULL, 'admin_only', NULL),
(6016, 622.73, 'depreciation', '2026-11-01', 'excel-import-2026|Bella_Jess|11|Depreciation', '2026-08-05 13:23:08.624968', 22, NULL, 'admin_only', NULL),
(6017, 1140.14, 'other', '2026-12-01', 'excel-import-2026|Bella_Jess|12|__SUMMARY__', '2026-08-05 13:23:08.895958', 22, NULL, 'operating', NULL),
(6018, 100.00, 'management', '2026-12-01', 'excel-import-2026|Bella_Jess|12|Property Management Fees', '2026-08-05 13:23:09.145842', 22, NULL, 'operating', NULL),
(6019, 200.00, 'maintenance', '2026-12-01', 'excel-import-2026|Bella_Jess|12|Repairs & Maintenance', '2026-08-05 13:23:09.399136', 22, NULL, 'operating', NULL),
(6020, 453.67, 'taxes', '2026-12-01', 'excel-import-2026|Bella_Jess|12|Property Taxes', '2026-08-05 13:23:09.649011', 22, NULL, 'operating', NULL),
(6021, 183.83, 'insurance', '2026-12-01', 'excel-import-2026|Bella_Jess|12|Insurance', '2026-08-05 13:23:09.903589', 22, NULL, 'operating', NULL),
(6022, 37.50, 'hoa', '2026-12-01', 'excel-import-2026|Bella_Jess|12|HOA Fees', '2026-08-05 13:23:10.151642', 22, NULL, 'operating', NULL),
(6023, 15.14, 'transportation', '2026-12-01', 'excel-import-2026|Bella_Jess|12|Transportation Cost', '2026-08-05 13:23:10.404710', 22, NULL, 'operating', NULL),
(6024, 150.00, 'supplies', '2026-12-01', 'excel-import-2026|Bella_Jess|12|Supplies & Materials', '2026-08-05 13:23:10.658210', 22, NULL, 'operating', NULL),
(6025, 1232.50, 'mortgage_interest', '2026-12-01', 'excel-import-2026|Bella_Jess|12|Mortgage Interest', '2026-08-05 13:23:10.925124', 22, NULL, 'admin_only', NULL),
(6026, 622.73, 'depreciation', '2026-12-01', 'excel-import-2026|Bella_Jess|12|Depreciation', '2026-08-05 13:23:11.174327', 22, NULL, 'admin_only', NULL),
(6027, 3657.57, 'other', '2025-01-01', 'excel-import-2025|Sherman|01|__SUMMARY__', '2026-08-05 13:23:14.703026', 25, NULL, 'operating', NULL),
(6028, 30.00, 'management', '2025-01-01', 'excel-import-2025|Sherman|01|Property Management Fees - Unit 1', '2026-08-05 13:23:14.972907', 25, NULL, 'operating', 150),
(6029, 167.32, 'utilities', '2025-01-01', 'excel-import-2025|Sherman|01|Water - Unit 1', '2026-08-05 13:23:15.225808', 25, NULL, 'operating', 150),
(6030, 40.00, 'management', '2025-01-01', 'excel-import-2025|Sherman|01|Property Management Fees - Unit 2', '2026-08-05 13:23:15.479024', 25, NULL, 'operating', 151),
(6031, 60.00, 'cleaning', '2025-01-01', 'excel-import-2025|Sherman|01|Cleaning Fees - Unit 2', '2026-08-05 13:23:15.733149', 25, NULL, 'operating', 151),
(6032, 250.00, 'other', '2025-01-01', 'excel-import-2025|Sherman|01|STR (Hotel Occupancy) - Unit 2', '2026-08-05 13:23:15.993159', 25, NULL, 'operating', 151),
(6033, 3000.00, 'maintenance', '2025-01-01', 'excel-import-2025|Sherman|01|Repairs & Maintenance - Unit 3', '2026-08-05 13:23:16.255629', 25, NULL, 'operating', 152),
(6034, 30.00, 'management', '2025-01-01', 'excel-import-2025|Sherman|01|Property Management Fees - Unit 4', '2026-08-05 13:23:16.510075', 25, NULL, 'operating', 153),
(6035, 50.25, 'utilities', '2025-01-01', 'excel-import-2025|Sherman|01|Internet - Unit 5', '2026-08-05 13:23:16.761298', 25, NULL, 'operating', 154),
(6036, 30.00, 'management', '2025-01-01', 'excel-import-2025|Sherman|01|Property Management Fees - Unit 6', '2026-08-05 13:23:17.017338', 25, NULL, 'operating', 155),
(6037, 310.92, 'other', '2025-02-01', 'excel-import-2025|Sherman|02|__SUMMARY__', '2026-08-05 13:23:17.270464', 25, NULL, 'operating', NULL),
(6038, 140.67, 'utilities', '2025-02-01', 'excel-import-2025|Sherman|02|Water - Unit 1', '2026-08-05 13:23:17.538020', 25, NULL, 'operating', 150),
(6039, 60.00, 'cleaning', '2025-02-01', 'excel-import-2025|Sherman|02|Cleaning Fees - Unit 2', '2026-08-05 13:23:17.793461', 25, NULL, 'operating', 151),
(6040, 30.00, 'management', '2025-02-01', 'excel-import-2025|Sherman|02|Property Management Fees - Unit 4', '2026-08-05 13:23:18.045602', 25, NULL, 'operating', 153),
(6041, 50.25, 'utilities', '2025-02-01', 'excel-import-2025|Sherman|02|Internet - Unit 5', '2026-08-05 13:23:18.293968', 25, NULL, 'operating', 154),
(6042, 30.00, 'management', '2025-02-01', 'excel-import-2025|Sherman|02|Property Management Fees - Unit 6', '2026-08-05 13:23:18.543675', 25, NULL, 'operating', 155),
(6043, 3250.92, 'other', '2025-03-01', 'excel-import-2025|Sherman|03|__SUMMARY__', '2026-08-05 13:23:18.804846', 25, NULL, 'operating', NULL),
(6044, 140.67, 'utilities', '2025-03-01', 'excel-import-2025|Sherman|03|Water - Unit 1', '2026-08-05 13:23:19.054167', 25, NULL, 'operating', 150),
(6045, 3000.00, 'maintenance', '2025-03-01', 'excel-import-2025|Sherman|03|Repairs & Maintenance - Unit 3', '2026-08-05 13:23:19.308931', 25, NULL, 'operating', 152),
(6046, 30.00, 'management', '2025-03-01', 'excel-import-2025|Sherman|03|Property Management Fees - Unit 4', '2026-08-05 13:23:19.558040', 25, NULL, 'operating', 153),
(6047, 50.25, 'utilities', '2025-03-01', 'excel-import-2025|Sherman|03|Internet - Unit 5', '2026-08-05 13:23:19.808988', 25, NULL, 'operating', 154),
(6048, 30.00, 'management', '2025-03-01', 'excel-import-2025|Sherman|03|Property Management Fees - Unit 6', '2026-08-05 13:23:20.057206', 25, NULL, 'operating', 155),
(6049, 285.36, 'other', '2025-04-01', 'excel-import-2025|Sherman|04|__SUMMARY__', '2026-08-05 13:23:20.318588', 25, NULL, 'operating', NULL),
(6050, 175.11, 'utilities', '2025-04-01', 'excel-import-2025|Sherman|04|Water - Unit 1', '2026-08-05 13:23:20.582038', 25, NULL, 'operating', 150),
(6051, 30.00, 'management', '2025-04-01', 'excel-import-2025|Sherman|04|Property Management Fees - Unit 4', '2026-08-05 13:23:20.829056', 25, NULL, 'operating', 153),
(6052, 50.25, 'utilities', '2025-04-01', 'excel-import-2025|Sherman|04|Internet - Unit 5', '2026-08-05 13:23:21.076973', 25, NULL, 'operating', 154),
(6053, 30.00, 'management', '2025-04-01', 'excel-import-2025|Sherman|04|Property Management Fees - Unit 6', '2026-08-05 13:23:21.330466', 25, NULL, 'operating', 155),
(6054, 343.05, 'other', '2025-05-01', 'excel-import-2025|Sherman|05|__SUMMARY__', '2026-08-05 13:23:21.587615', 25, NULL, 'operating', NULL),
(6055, 232.80, 'utilities', '2025-05-01', 'excel-import-2025|Sherman|05|Water - Unit 1', '2026-08-05 13:23:21.842934', 25, NULL, 'operating', 150),
(6056, 30.00, 'management', '2025-05-01', 'excel-import-2025|Sherman|05|Property Management Fees - Unit 4', '2026-08-05 13:23:22.103131', 25, NULL, 'operating', 153),
(6057, 50.25, 'utilities', '2025-05-01', 'excel-import-2025|Sherman|05|Internet - Unit 5', '2026-08-05 13:23:22.353030', 25, NULL, 'operating', 154),
(6058, 30.00, 'management', '2025-05-01', 'excel-import-2025|Sherman|05|Property Management Fees - Unit 6', '2026-08-05 13:23:22.608917', 25, NULL, 'operating', 155),
(6059, 2296.14, 'other', '2025-06-01', 'excel-import-2025|Sherman|06|__SUMMARY__', '2026-08-05 13:23:22.857871', 25, NULL, 'operating', NULL),
(6060, 155.06, 'utilities', '2025-06-01', 'excel-import-2025|Sherman|06|Water - Unit 1', '2026-08-05 13:23:23.106806', 25, NULL, 'operating', 150),
(6061, 2000.00, 'maintenance', '2025-06-01', 'excel-import-2025|Sherman|06|Repairs & Maintenance - Unit 3', '2026-08-05 13:23:23.357200', 25, NULL, 'operating', 152),
(6062, 30.00, 'management', '2025-06-01', 'excel-import-2025|Sherman|06|Property Management Fees - Unit 4', '2026-08-05 13:23:23.625686', 25, NULL, 'operating', 153),
(6063, 81.08, 'utilities', '2025-06-01', 'excel-import-2025|Sherman|06|Internet - Unit 5', '2026-08-05 13:23:23.876457', 25, NULL, 'operating', 154),
(6064, 30.00, 'management', '2025-06-01', 'excel-import-2025|Sherman|06|Property Management Fees - Unit 6', '2026-08-05 13:23:24.130992', 25, NULL, 'operating', 155),
(6065, 141.08, 'other', '2025-07-01', 'excel-import-2025|Sherman|07|__SUMMARY__', '2026-08-05 13:23:24.381145', 25, NULL, 'operating', NULL),
(6066, 30.00, 'management', '2025-07-01', 'excel-import-2025|Sherman|07|Property Management Fees - Unit 4', '2026-08-05 13:23:24.657859', 25, NULL, 'operating', 153),
(6067, 81.08, 'utilities', '2025-07-01', 'excel-import-2025|Sherman|07|Internet - Unit 5', '2026-08-05 13:23:24.910837', 25, NULL, 'operating', 154),
(6068, 30.00, 'management', '2025-07-01', 'excel-import-2025|Sherman|07|Property Management Fees - Unit 6', '2026-08-05 13:23:25.166845', 25, NULL, 'operating', 155),
(6069, 316.76, 'depreciation', '2025-07-01', 'excel-import-2025|Sherman|07|Depreciation', '2026-08-05 13:23:25.416582', 25, NULL, 'admin_only', NULL),
(6070, 60.00, 'other', '2025-08-01', 'excel-import-2025|Sherman|08|__SUMMARY__', '2026-08-05 13:23:25.664053', 25, NULL, 'operating', NULL),
(6071, 30.00, 'management', '2025-08-01', 'excel-import-2025|Sherman|08|Property Management Fees - Unit 4', '2026-08-05 13:23:25.938303', 25, NULL, 'operating', 153),
(6072, 30.00, 'management', '2025-08-01', 'excel-import-2025|Sherman|08|Property Management Fees - Unit 6', '2026-08-05 13:23:26.191024', 25, NULL, 'operating', 155),
(6073, 316.76, 'depreciation', '2025-08-01', 'excel-import-2025|Sherman|08|Depreciation', '2026-08-05 13:23:26.442563', 25, NULL, 'admin_only', NULL),
(6074, 60.00, 'other', '2025-09-01', 'excel-import-2025|Sherman|09|__SUMMARY__', '2026-08-05 13:23:26.693815', 25, NULL, 'operating', NULL),
(6075, 30.00, 'management', '2025-09-01', 'excel-import-2025|Sherman|09|Property Management Fees - Unit 4', '2026-08-05 13:23:26.947337', 25, NULL, 'operating', 153),
(6076, 30.00, 'management', '2025-09-01', 'excel-import-2025|Sherman|09|Property Management Fees - Unit 6', '2026-08-05 13:23:27.199665', 25, NULL, 'operating', 155),
(6077, 316.76, 'depreciation', '2025-09-01', 'excel-import-2025|Sherman|09|Depreciation', '2026-08-05 13:23:27.457534', 25, NULL, 'admin_only', NULL),
(6078, 60.00, 'other', '2025-10-01', 'excel-import-2025|Sherman|10|__SUMMARY__', '2026-08-05 13:23:27.707290', 25, NULL, 'operating', NULL),
(6079, 30.00, 'management', '2025-10-01', 'excel-import-2025|Sherman|10|Property Management Fees - Unit 4', '2026-08-05 13:23:27.959144', 25, NULL, 'operating', 153),
(6080, 30.00, 'management', '2025-10-01', 'excel-import-2025|Sherman|10|Property Management Fees - Unit 6', '2026-08-05 13:23:28.206760', 25, NULL, 'operating', 155),
(6081, 316.76, 'depreciation', '2025-10-01', 'excel-import-2025|Sherman|10|Depreciation', '2026-08-05 13:23:28.462308', 25, NULL, 'admin_only', NULL),
(6082, 60.00, 'other', '2025-11-01', 'excel-import-2025|Sherman|11|__SUMMARY__', '2026-08-05 13:23:28.724219', 25, NULL, 'operating', NULL),
(6083, 30.00, 'management', '2025-11-01', 'excel-import-2025|Sherman|11|Property Management Fees - Unit 4', '2026-08-05 13:23:28.977451', 25, NULL, 'operating', 153),
(6084, 30.00, 'management', '2025-11-01', 'excel-import-2025|Sherman|11|Property Management Fees - Unit 6', '2026-08-05 13:23:29.228933', 25, NULL, 'operating', 155),
(6085, 316.76, 'depreciation', '2025-11-01', 'excel-import-2025|Sherman|11|Depreciation', '2026-08-05 13:23:29.492716', 25, NULL, 'admin_only', NULL),
(6086, 60.00, 'other', '2025-12-01', 'excel-import-2025|Sherman|12|__SUMMARY__', '2026-08-05 13:23:29.739520', 25, NULL, 'operating', NULL),
(6087, 30.00, 'management', '2025-12-01', 'excel-import-2025|Sherman|12|Property Management Fees - Unit 4', '2026-08-05 13:23:30.004192', 25, NULL, 'operating', 153),
(6088, 30.00, 'management', '2025-12-01', 'excel-import-2025|Sherman|12|Property Management Fees - Unit 6', '2026-08-05 13:23:30.257994', 25, NULL, 'operating', 155),
(6089, 316.76, 'depreciation', '2025-12-01', 'excel-import-2025|Sherman|12|Depreciation', '2026-08-05 13:23:30.509961', 25, NULL, 'admin_only', NULL),
(6090, 458.00, 'other', '2026-01-01', 'excel-import-2026|Tomball|01|__SUMMARY__', '2026-08-05 13:23:34.303636', 24, NULL, 'operating', NULL),
(6091, 149.00, 'utilities', '2026-01-01', 'excel-import-2026|Tomball|01|Electricity', '2026-08-05 13:23:34.556801', 24, NULL, 'operating', NULL),
(6092, 80.00, 'utilities', '2026-01-01', 'excel-import-2026|Tomball|01|Water', '2026-08-05 13:23:34.814675', 24, NULL, 'operating', NULL),
(6093, 229.00, 'utilities', '2026-01-01', 'excel-import-2026|Tomball|01|Utilities (Landlord Paid)', '2026-08-05 13:23:35.073018', 24, NULL, 'operating', NULL),
(6094, 458.00, 'other', '2026-02-01', 'excel-import-2026|Tomball|02|__SUMMARY__', '2026-08-05 13:23:35.321259', 24, NULL, 'operating', NULL),
(6095, 149.00, 'utilities', '2026-02-01', 'excel-import-2026|Tomball|02|Electricity', '2026-08-05 13:23:35.571469', 24, NULL, 'operating', NULL),
(6096, 80.00, 'utilities', '2026-02-01', 'excel-import-2026|Tomball|02|Water', '2026-08-05 13:23:35.820761', 24, NULL, 'operating', NULL),
(6097, 229.00, 'utilities', '2026-02-01', 'excel-import-2026|Tomball|02|Utilities (Landlord Paid)', '2026-08-05 13:23:36.099098', 24, NULL, 'operating', NULL),
(6098, 458.00, 'other', '2026-03-01', 'excel-import-2026|Tomball|03|__SUMMARY__', '2026-08-05 13:23:36.352656', 24, NULL, 'operating', NULL),
(6099, 149.00, 'utilities', '2026-03-01', 'excel-import-2026|Tomball|03|Electricity', '2026-08-05 13:23:36.605002', 24, NULL, 'operating', NULL),
(6100, 80.00, 'utilities', '2026-03-01', 'excel-import-2026|Tomball|03|Water', '2026-08-05 13:23:36.855157', 24, NULL, 'operating', NULL),
(6101, 229.00, 'utilities', '2026-03-01', 'excel-import-2026|Tomball|03|Utilities (Landlord Paid)', '2026-08-05 13:23:37.108386', 24, NULL, 'operating', NULL),
(6102, 458.00, 'other', '2026-04-01', 'excel-import-2026|Tomball|04|__SUMMARY__', '2026-08-05 13:23:37.364747', 24, NULL, 'operating', NULL),
(6103, 149.00, 'utilities', '2026-04-01', 'excel-import-2026|Tomball|04|Electricity', '2026-08-05 13:23:37.614568', 24, NULL, 'operating', NULL),
(6104, 80.00, 'utilities', '2026-04-01', 'excel-import-2026|Tomball|04|Water', '2026-08-05 13:23:37.862658', 24, NULL, 'operating', NULL),
(6105, 229.00, 'utilities', '2026-04-01', 'excel-import-2026|Tomball|04|Utilities (Landlord Paid)', '2026-08-05 13:23:38.114598', 24, NULL, 'operating', NULL),
(6106, 7760.54, 'other', '2026-05-01', 'excel-import-2026|Tomball|05|__SUMMARY__', '2026-08-05 13:23:38.367255', 24, NULL, 'operating', NULL),
(6107, 100.00, 'management', '2026-05-01', 'excel-import-2026|Tomball|05|Property Management Fees', '2026-08-05 13:23:38.618381', 24, NULL, 'operating', NULL),
(6108, 200.00, 'maintenance', '2026-05-01', 'excel-import-2026|Tomball|05|Repairs & Maintenance', '2026-08-05 13:23:38.869496', 24, NULL, 'operating', NULL),
(6109, 453.67, 'taxes', '2026-05-01', 'excel-import-2026|Tomball|05|Property Taxes', '2026-08-05 13:23:39.147941', 24, NULL, 'operating', NULL),
(6110, 183.83, 'insurance', '2026-05-01', 'excel-import-2026|Tomball|05|Insurance', '2026-08-05 13:23:39.396365', 24, NULL, 'operating', NULL),
(6111, 600.00, 'maintenance', '2026-05-01', 'excel-import-2026|Tomball|05|Inspection', '2026-08-05 13:23:39.647435', 24, NULL, 'operating', NULL),
(6112, 825.00, 'maintenance', '2026-05-01', 'excel-import-2026|Tomball|05|Appraisal', '2026-08-05 13:23:39.900342', 24, NULL, 'operating', NULL),
(6113, 37.50, 'hoa', '2026-05-01', 'excel-import-2026|Tomball|05|HOA Fees', '2026-08-05 13:23:40.150175', 24, NULL, 'operating', NULL),
(6114, 242.27, 'transportation', '2026-05-01', 'excel-import-2026|Tomball|05|Transportation Cost', '2026-08-05 13:23:40.399464', 24, NULL, 'operating', NULL),
(6115, 350.00, 'legal', '2026-05-01', 'excel-import-2026|Tomball|05|Legal & Professional Fees', '2026-08-05 13:23:40.655361', 24, NULL, 'operating', NULL),
(6116, 4500.00, 'supplies', '2026-05-01', 'excel-import-2026|Tomball|05|Supplies & Materials', '2026-08-05 13:23:40.909145', 24, NULL, 'operating', NULL),
(6117, 149.00, 'utilities', '2026-05-01', 'excel-import-2026|Tomball|05|Electricity', '2026-08-05 13:23:41.164389', 24, NULL, 'operating', NULL),
(6118, 80.00, 'utilities', '2026-05-01', 'excel-import-2026|Tomball|05|Water', '2026-08-05 13:23:41.412584', 24, NULL, 'operating', NULL),
(6119, 229.00, 'utilities', '2026-05-01', 'excel-import-2026|Tomball|05|Utilities (Landlord Paid)', '2026-08-05 13:23:41.676834', 24, NULL, 'operating', NULL),
(6120, 1232.50, 'mortgage_interest', '2026-05-01', 'excel-import-2026|Tomball|05|Mortgage Interest', '2026-08-05 13:23:41.936213', 24, NULL, 'admin_only', NULL),
(6121, 2126.35, 'other', '2026-06-01', 'excel-import-2026|Tomball|06|__SUMMARY__', '2026-08-05 13:23:42.186632', 24, NULL, 'operating', NULL),
(6122, 100.00, 'management', '2026-06-01', 'excel-import-2026|Tomball|06|Property Management Fees', '2026-08-05 13:23:42.442397', 24, NULL, 'operating', NULL),
(6123, 453.67, 'taxes', '2026-06-01', 'excel-import-2026|Tomball|06|Property Taxes', '2026-08-05 13:23:42.695345', 24, NULL, 'operating', NULL),
(6124, 183.83, 'insurance', '2026-06-01', 'excel-import-2026|Tomball|06|Insurance', '2026-08-05 13:23:43.009960', 24, NULL, 'operating', NULL),
(6125, 37.50, 'hoa', '2026-06-01', 'excel-import-2026|Tomball|06|HOA Fees', '2026-08-05 13:23:43.262065', 24, NULL, 'operating', NULL),
(6126, 1000.00, 'advertising', '2026-06-01', 'excel-import-2026|Tomball|06|Advertising / Leasing', '2026-08-05 13:23:43.521663', 24, NULL, 'operating', NULL),
(6127, 90.85, 'transportation', '2026-06-01', 'excel-import-2026|Tomball|06|Transportation Cost', '2026-08-05 13:23:43.785213', 24, NULL, 'operating', NULL),
(6128, 200.00, 'supplies', '2026-06-01', 'excel-import-2026|Tomball|06|Supplies & Materials', '2026-08-05 13:23:44.039078', 24, NULL, 'operating', NULL),
(6129, 11.23, 'utilities', '2026-06-01', 'excel-import-2026|Tomball|06|Electricity', '2026-08-05 13:23:44.289909', 24, NULL, 'operating', NULL),
(6130, 20.00, 'utilities', '2026-06-01', 'excel-import-2026|Tomball|06|Water', '2026-08-05 13:23:44.545364', 24, NULL, 'operating', NULL),
(6131, 31.23, 'utilities', '2026-06-01', 'excel-import-2026|Tomball|06|Utilities (Landlord Paid)', '2026-08-05 13:23:44.794246', 24, NULL, 'operating', NULL),
(6132, 1232.50, 'mortgage_interest', '2026-06-01', 'excel-import-2026|Tomball|06|Mortgage Interest', '2026-08-05 13:23:45.056237', 24, NULL, 'admin_only', NULL),
(6133, 1449.02, 'other', '2026-07-01', 'excel-import-2026|Tomball|07|__SUMMARY__', '2026-08-05 13:23:45.315458', 24, NULL, 'operating', NULL),
(6134, 100.00, 'management', '2026-07-01', 'excel-import-2026|Tomball|07|Property Management Fees', '2026-08-05 13:23:45.567270', 24, NULL, 'operating', NULL),
(6135, 453.67, 'taxes', '2026-07-01', 'excel-import-2026|Tomball|07|Property Taxes', '2026-08-05 13:23:45.826281', 24, NULL, 'operating', NULL),
(6136, 183.83, 'insurance', '2026-07-01', 'excel-import-2026|Tomball|07|Insurance', '2026-08-05 13:23:46.078969', 24, NULL, 'operating', NULL),
(6137, 37.50, 'hoa', '2026-07-01', 'excel-import-2026|Tomball|07|HOA Fees', '2026-08-05 13:23:46.332733', 24, NULL, 'operating', NULL),
(6138, 250.00, 'advertising', '2026-07-01', 'excel-import-2026|Tomball|07|Advertising / Leasing', '2026-08-05 13:23:46.586500', 24, NULL, 'operating', NULL),
(6139, 90.85, 'transportation', '2026-07-01', 'excel-import-2026|Tomball|07|Transportation Cost', '2026-08-05 13:23:46.837856', 24, NULL, 'operating', NULL),
(6140, 200.00, 'supplies', '2026-07-01', 'excel-import-2026|Tomball|07|Supplies & Materials', '2026-08-05 13:23:47.089177', 24, NULL, 'operating', NULL),
(6141, 83.17, 'utilities', '2026-07-01', 'excel-import-2026|Tomball|07|Electricity', '2026-08-05 13:23:47.336922', 24, NULL, 'operating', NULL),
(6142, 50.00, 'utilities', '2026-07-01', 'excel-import-2026|Tomball|07|Water', '2026-08-05 13:23:47.589151', 24, NULL, 'operating', NULL),
(6143, 133.17, 'utilities', '2026-07-01', 'excel-import-2026|Tomball|07|Utilities (Landlord Paid)', '2026-08-05 13:23:47.838545', 24, NULL, 'operating', NULL),
(6144, 1232.50, 'mortgage_interest', '2026-07-01', 'excel-import-2026|Tomball|07|Mortgage Interest', '2026-08-05 13:23:48.091146', 24, NULL, 'admin_only', NULL),
(6145, 1705.47, 'other', '2026-08-01', 'excel-import-2026|Tomball|08|__SUMMARY__', '2026-08-05 13:23:48.349674', 24, NULL, 'operating', NULL),
(6146, 100.00, 'management', '2026-08-01', 'excel-import-2026|Tomball|08|Property Management Fees', '2026-08-05 13:23:48.602869', 24, NULL, 'operating', NULL),
(6147, 453.67, 'taxes', '2026-08-01', 'excel-import-2026|Tomball|08|Property Taxes', '2026-08-05 13:23:48.853913', 24, NULL, 'operating', NULL),
(6148, 183.83, 'insurance', '2026-08-01', 'excel-import-2026|Tomball|08|Insurance', '2026-08-05 13:23:49.107002', 24, NULL, 'operating', NULL),
(6149, 37.50, 'hoa', '2026-08-01', 'excel-import-2026|Tomball|08|HOA Fees', '2026-08-05 13:23:49.405201', 24, NULL, 'operating', NULL),
(6150, 250.00, 'advertising', '2026-08-01', 'excel-import-2026|Tomball|08|Advertising / Leasing', '2026-08-05 13:23:49.662863', 24, NULL, 'operating', NULL),
(6151, 242.27, 'transportation', '2026-08-01', 'excel-import-2026|Tomball|08|Transportation Cost', '2026-08-05 13:23:49.914341', 24, NULL, 'operating', NULL),
(6152, 200.00, 'supplies', '2026-08-01', 'excel-import-2026|Tomball|08|Supplies & Materials', '2026-08-05 13:23:50.173956', 24, NULL, 'operating', NULL),
(6153, 108.20, 'utilities', '2026-08-01', 'excel-import-2026|Tomball|08|Electricity', '2026-08-05 13:23:50.425303', 24, NULL, 'operating', NULL),
(6154, 130.00, 'utilities', '2026-08-01', 'excel-import-2026|Tomball|08|Water', '2026-08-05 13:23:50.675675', 24, NULL, 'operating', NULL),
(6155, 238.20, 'utilities', '2026-08-01', 'excel-import-2026|Tomball|08|Utilities (Landlord Paid)', '2026-08-05 13:23:50.929215', 24, NULL, 'operating', NULL),
(6156, 1232.50, 'mortgage_interest', '2026-08-01', 'excel-import-2026|Tomball|08|Mortgage Interest', '2026-08-05 13:23:51.176663', 24, NULL, 'admin_only', NULL),
(6157, 1627.50, 'other', '2026-09-01', 'excel-import-2026|Tomball|09|__SUMMARY__', '2026-08-05 13:23:51.428973', 24, NULL, 'operating', NULL),
(6158, 100.00, 'management', '2026-09-01', 'excel-import-2026|Tomball|09|Property Management Fees', '2026-08-05 13:23:51.682772', 24, NULL, 'operating', NULL),
(6159, 453.67, 'taxes', '2026-09-01', 'excel-import-2026|Tomball|09|Property Taxes', '2026-08-05 13:23:51.934692', 24, NULL, 'operating', NULL),
(6160, 183.83, 'insurance', '2026-09-01', 'excel-import-2026|Tomball|09|Insurance', '2026-08-05 13:23:52.189179', 24, NULL, 'operating', NULL),
(6161, 37.50, 'hoa', '2026-09-01', 'excel-import-2026|Tomball|09|HOA Fees', '2026-08-05 13:23:52.437671', 24, NULL, 'operating', NULL),
(6162, 250.00, 'advertising', '2026-09-01', 'excel-import-2026|Tomball|09|Advertising / Leasing', '2026-08-05 13:23:52.686610', 24, NULL, 'operating', NULL),
(6163, 242.27, 'transportation', '2026-09-01', 'excel-import-2026|Tomball|09|Transportation Cost', '2026-08-05 13:23:52.937417', 24, NULL, 'operating', NULL),
(6164, 200.00, 'supplies', '2026-09-01', 'excel-import-2026|Tomball|09|Supplies & Materials', '2026-08-05 13:23:53.185003', 24, NULL, 'operating', NULL),
(6165, 118.66, 'utilities', '2026-09-01', 'excel-import-2026|Tomball|09|Electricity', '2026-08-05 13:23:53.432924', 24, NULL, 'operating', NULL),
(6166, 41.57, 'utilities', '2026-09-01', 'excel-import-2026|Tomball|09|Water', '2026-08-05 13:23:53.696868', 24, NULL, 'operating', NULL),
(6167, 160.23, 'utilities', '2026-09-01', 'excel-import-2026|Tomball|09|Utilities (Landlord Paid)', '2026-08-05 13:23:53.947424', 24, NULL, 'operating', NULL),
(6168, 1232.50, 'mortgage_interest', '2026-09-01', 'excel-import-2026|Tomball|09|Mortgage Interest', '2026-08-05 13:23:54.196950', 24, NULL, 'admin_only', NULL),
(6169, 1980.85, 'other', '2026-10-01', 'excel-import-2026|Tomball|10|__SUMMARY__', '2026-08-05 13:23:54.522070', 24, NULL, 'operating', NULL),
(6170, 100.00, 'management', '2026-10-01', 'excel-import-2026|Tomball|10|Property Management Fees', '2026-08-05 13:23:54.779942', 24, NULL, 'operating', NULL),
(6171, 500.00, 'maintenance', '2026-10-01', 'excel-import-2026|Tomball|10|Repairs & Maintenance', '2026-08-05 13:23:55.029111', 24, NULL, 'operating', NULL),
(6172, 453.67, 'taxes', '2026-10-01', 'excel-import-2026|Tomball|10|Property Taxes', '2026-08-05 13:23:55.286077', 24, NULL, 'operating', NULL),
(6173, 183.83, 'insurance', '2026-10-01', 'excel-import-2026|Tomball|10|Insurance', '2026-08-05 13:23:55.535077', 24, NULL, 'operating', NULL),
(6174, 37.50, 'hoa', '2026-10-01', 'excel-import-2026|Tomball|10|HOA Fees', '2026-08-05 13:23:55.785356', 24, NULL, 'operating', NULL),
(6175, 150.00, 'advertising', '2026-10-01', 'excel-import-2026|Tomball|10|Advertising / Leasing', '2026-08-05 13:23:56.035045', 24, NULL, 'operating', NULL),
(6176, 242.27, 'transportation', '2026-10-01', 'excel-import-2026|Tomball|10|Transportation Cost', '2026-08-05 13:23:56.289966', 24, NULL, 'operating', NULL),
(6177, 200.00, 'supplies', '2026-10-01', 'excel-import-2026|Tomball|10|Supplies & Materials', '2026-08-05 13:23:56.539110', 24, NULL, 'operating', NULL),
(6178, 19.22, 'utilities', '2026-10-01', 'excel-import-2026|Tomball|10|Electricity', '2026-08-05 13:23:56.794626', 24, NULL, 'operating', NULL),
(6179, 94.36, 'utilities', '2026-10-01', 'excel-import-2026|Tomball|10|Water', '2026-08-05 13:23:57.044531', 24, NULL, 'operating', NULL),
(6180, 113.58, 'utilities', '2026-10-01', 'excel-import-2026|Tomball|10|Utilities (Landlord Paid)', '2026-08-05 13:23:57.298902', 24, NULL, 'operating', NULL),
(6181, 1232.50, 'mortgage_interest', '2026-10-01', 'excel-import-2026|Tomball|10|Mortgage Interest', '2026-08-05 13:23:57.545993', 24, NULL, 'admin_only', NULL),
(6182, 2128.85, 'other', '2026-11-01', 'excel-import-2026|Tomball|11|__SUMMARY__', '2026-08-05 13:23:57.798644', 24, NULL, 'operating', NULL),
(6183, 100.00, 'management', '2026-11-01', 'excel-import-2026|Tomball|11|Property Management Fees', '2026-08-05 13:23:58.049854', 24, NULL, 'operating', NULL),
(6184, 650.00, 'maintenance', '2026-11-01', 'excel-import-2026|Tomball|11|Repairs & Maintenance', '2026-08-05 13:23:58.298841', 24, NULL, 'operating', NULL),
(6185, 453.67, 'taxes', '2026-11-01', 'excel-import-2026|Tomball|11|Property Taxes', '2026-08-05 13:23:58.548197', 24, NULL, 'operating', NULL),
(6186, 183.83, 'insurance', '2026-11-01', 'excel-import-2026|Tomball|11|Insurance', '2026-08-05 13:23:58.814151', 24, NULL, 'operating', NULL),
(6187, 37.50, 'hoa', '2026-11-01', 'excel-import-2026|Tomball|11|HOA Fees', '2026-08-05 13:23:59.065158', 24, NULL, 'operating', NULL),
(6188, 150.00, 'advertising', '2026-11-01', 'excel-import-2026|Tomball|11|Advertising / Leasing', '2026-08-05 13:23:59.317015', 24, NULL, 'operating', NULL),
(6189, 242.27, 'transportation', '2026-11-01', 'excel-import-2026|Tomball|11|Transportation Cost', '2026-08-05 13:23:59.569460', 24, NULL, 'operating', NULL),
(6190, 150.00, 'supplies', '2026-11-01', 'excel-import-2026|Tomball|11|Supplies & Materials', '2026-08-05 13:23:59.819103', 24, NULL, 'operating', NULL),
(6191, 17.22, 'utilities', '2026-11-01', 'excel-import-2026|Tomball|11|Electricity', '2026-08-05 13:24:00.071097', 24, NULL, 'operating', NULL),
(6192, 144.36, 'utilities', '2026-11-01', 'excel-import-2026|Tomball|11|Water', '2026-08-05 13:24:00.323484', 24, NULL, 'operating', NULL),
(6193, 161.58, 'utilities', '2026-11-01', 'excel-import-2026|Tomball|11|Utilities (Landlord Paid)', '2026-08-05 13:24:00.577754', 24, NULL, 'operating', NULL),
(6194, 1232.50, 'mortgage_interest', '2026-11-01', 'excel-import-2026|Tomball|11|Mortgage Interest', '2026-08-05 13:24:00.830250', 24, NULL, 'admin_only', NULL),
(6195, 1262.31, 'other', '2026-12-01', 'excel-import-2026|Tomball|12|__SUMMARY__', '2026-08-05 13:24:01.082774', 24, NULL, 'operating', NULL),
(6196, 100.00, 'management', '2026-12-01', 'excel-import-2026|Tomball|12|Property Management Fees', '2026-08-05 13:24:01.332882', 24, NULL, 'operating', NULL),
(6197, 200.00, 'maintenance', '2026-12-01', 'excel-import-2026|Tomball|12|Repairs & Maintenance', '2026-08-05 13:24:01.588999', 24, NULL, 'operating', NULL),
(6198, 453.67, 'taxes', '2026-12-01', 'excel-import-2026|Tomball|12|Property Taxes', '2026-08-05 13:24:01.844639', 24, NULL, 'operating', NULL),
(6199, 183.83, 'insurance', '2026-12-01', 'excel-import-2026|Tomball|12|Insurance', '2026-08-05 13:24:02.100745', 24, NULL, 'operating', NULL),
(6200, 37.50, 'hoa', '2026-12-01', 'excel-import-2026|Tomball|12|HOA Fees', '2026-08-05 13:24:02.359660', 24, NULL, 'operating', NULL),
(6201, 15.14, 'transportation', '2026-12-01', 'excel-import-2026|Tomball|12|Transportation Cost', '2026-08-05 13:24:02.611583', 24, NULL, 'operating', NULL),
(6202, 150.00, 'supplies', '2026-12-01', 'excel-import-2026|Tomball|12|Supplies & Materials', '2026-08-05 13:24:02.861630', 24, NULL, 'operating', NULL),
(6203, 17.53, 'utilities', '2026-12-01', 'excel-import-2026|Tomball|12|Electricity', '2026-08-05 13:24:03.113780', 24, NULL, 'operating', NULL),
(6204, 104.64, 'utilities', '2026-12-01', 'excel-import-2026|Tomball|12|Water', '2026-08-05 13:24:03.383099', 24, NULL, 'operating', NULL),
(6205, 122.17, 'utilities', '2026-12-01', 'excel-import-2026|Tomball|12|Utilities (Landlord Paid)', '2026-08-05 13:24:03.636353', 24, NULL, 'operating', NULL);
INSERT INTO `api_operatingexpense` (`id`, `amount`, `category`, `date`, `notes`, `created_at`, `property_id`, `created_by_id`, `visibility`, `unit_id`) VALUES
(6206, 1232.50, 'mortgage_interest', '2026-12-01', 'excel-import-2026|Tomball|12|Mortgage Interest', '2026-08-05 13:24:03.890498', 24, NULL, 'admin_only', NULL),
(6207, 0.00, 'other', '2026-01-01', 'excel-import-2026|Conroe|01|__SUMMARY__', '2026-08-05 13:24:07.274905', 16, NULL, 'operating', NULL),
(6208, 0.00, 'other', '2026-02-01', 'excel-import-2026|Conroe|02|__SUMMARY__', '2026-08-05 13:24:07.602750', 16, NULL, 'operating', NULL),
(6209, 0.00, 'other', '2026-03-01', 'excel-import-2026|Conroe|03|__SUMMARY__', '2026-08-05 13:24:07.878317', 16, NULL, 'operating', NULL),
(6210, 0.00, 'other', '2026-04-01', 'excel-import-2026|Conroe|04|__SUMMARY__', '2026-08-05 13:24:08.155317', 16, NULL, 'operating', NULL),
(6211, 7760.54, 'other', '2026-05-01', 'excel-import-2026|Conroe|05|__SUMMARY__', '2026-08-05 13:24:08.435403', 16, NULL, 'operating', NULL),
(6212, 100.00, 'management', '2026-05-01', 'excel-import-2026|Conroe|05|Property Management Fees', '2026-08-05 13:24:08.689783', 16, NULL, 'operating', NULL),
(6213, 200.00, 'maintenance', '2026-05-01', 'excel-import-2026|Conroe|05|Repairs & Maintenance', '2026-08-05 13:24:08.958637', 16, NULL, 'operating', NULL),
(6214, 453.67, 'taxes', '2026-05-01', 'excel-import-2026|Conroe|05|Property Taxes', '2026-08-05 13:24:09.209758', 16, NULL, 'operating', NULL),
(6215, 183.83, 'insurance', '2026-05-01', 'excel-import-2026|Conroe|05|Insurance', '2026-08-05 13:24:09.478966', 16, NULL, 'operating', NULL),
(6216, 600.00, 'maintenance', '2026-05-01', 'excel-import-2026|Conroe|05|Inspection', '2026-08-05 13:24:09.754979', 16, NULL, 'operating', NULL),
(6217, 825.00, 'maintenance', '2026-05-01', 'excel-import-2026|Conroe|05|Appraisal', '2026-08-05 13:24:10.037568', 16, NULL, 'operating', NULL),
(6218, 37.50, 'hoa', '2026-05-01', 'excel-import-2026|Conroe|05|HOA Fees', '2026-08-05 13:24:10.291795', 16, NULL, 'operating', NULL),
(6219, 242.27, 'transportation', '2026-05-01', 'excel-import-2026|Conroe|05|Transportation Cost', '2026-08-05 13:24:10.562954', 16, NULL, 'operating', NULL),
(6220, 350.00, 'legal', '2026-05-01', 'excel-import-2026|Conroe|05|Legal & Professional Fees', '2026-08-05 13:24:10.814267', 16, NULL, 'operating', NULL),
(6221, 4500.00, 'supplies', '2026-05-01', 'excel-import-2026|Conroe|05|Supplies & Materials', '2026-08-05 13:24:11.065614', 16, NULL, 'operating', NULL),
(6222, 149.00, 'utilities', '2026-05-01', 'excel-import-2026|Conroe|05|Electricity', '2026-08-05 13:24:11.336353', 16, NULL, 'operating', NULL),
(6223, 80.00, 'utilities', '2026-05-01', 'excel-import-2026|Conroe|05|Water', '2026-08-05 13:24:11.586454', 16, NULL, 'operating', NULL),
(6224, 229.00, 'utilities', '2026-05-01', 'excel-import-2026|Conroe|05|Utilities (Landlord Paid)', '2026-08-05 13:24:11.842237', 16, NULL, 'operating', NULL),
(6225, 1232.50, 'mortgage_interest', '2026-05-01', 'excel-import-2026|Conroe|05|Mortgage Interest', '2026-08-05 13:24:12.093425', 16, NULL, 'admin_only', NULL),
(6226, 2126.35, 'other', '2026-06-01', 'excel-import-2026|Conroe|06|__SUMMARY__', '2026-08-05 13:24:12.349557', 16, NULL, 'operating', NULL),
(6227, 100.00, 'management', '2026-06-01', 'excel-import-2026|Conroe|06|Property Management Fees', '2026-08-05 13:24:12.608089', 16, NULL, 'operating', NULL),
(6228, 453.67, 'taxes', '2026-06-01', 'excel-import-2026|Conroe|06|Property Taxes', '2026-08-05 13:24:12.858572', 16, NULL, 'operating', NULL),
(6229, 183.83, 'insurance', '2026-06-01', 'excel-import-2026|Conroe|06|Insurance', '2026-08-05 13:24:13.112653', 16, NULL, 'operating', NULL),
(6230, 37.50, 'hoa', '2026-06-01', 'excel-import-2026|Conroe|06|HOA Fees', '2026-08-05 13:24:13.366781', 16, NULL, 'operating', NULL),
(6231, 1000.00, 'advertising', '2026-06-01', 'excel-import-2026|Conroe|06|Advertising / Leasing', '2026-08-05 13:24:13.618284', 16, NULL, 'operating', NULL),
(6232, 90.85, 'transportation', '2026-06-01', 'excel-import-2026|Conroe|06|Transportation Cost', '2026-08-05 13:24:13.872918', 16, NULL, 'operating', NULL),
(6233, 200.00, 'supplies', '2026-06-01', 'excel-import-2026|Conroe|06|Supplies & Materials', '2026-08-05 13:24:14.125028', 16, NULL, 'operating', NULL),
(6234, 11.23, 'utilities', '2026-06-01', 'excel-import-2026|Conroe|06|Electricity', '2026-08-05 13:24:14.376215', 16, NULL, 'operating', NULL),
(6235, 20.00, 'utilities', '2026-06-01', 'excel-import-2026|Conroe|06|Water', '2026-08-05 13:24:14.627823', 16, NULL, 'operating', NULL),
(6236, 31.23, 'utilities', '2026-06-01', 'excel-import-2026|Conroe|06|Utilities (Landlord Paid)', '2026-08-05 13:24:14.878130', 16, NULL, 'operating', NULL),
(6237, 1232.50, 'mortgage_interest', '2026-06-01', 'excel-import-2026|Conroe|06|Mortgage Interest', '2026-08-05 13:24:15.135173', 16, NULL, 'admin_only', NULL),
(6238, 1449.02, 'other', '2026-07-01', 'excel-import-2026|Conroe|07|__SUMMARY__', '2026-08-05 13:24:15.398292', 16, NULL, 'operating', NULL),
(6239, 100.00, 'management', '2026-07-01', 'excel-import-2026|Conroe|07|Property Management Fees', '2026-08-05 13:24:15.649518', 16, NULL, 'operating', NULL),
(6240, 453.67, 'taxes', '2026-07-01', 'excel-import-2026|Conroe|07|Property Taxes', '2026-08-05 13:24:15.902190', 16, NULL, 'operating', NULL),
(6241, 183.83, 'insurance', '2026-07-01', 'excel-import-2026|Conroe|07|Insurance', '2026-08-05 13:24:16.153352', 16, NULL, 'operating', NULL),
(6242, 37.50, 'hoa', '2026-07-01', 'excel-import-2026|Conroe|07|HOA Fees', '2026-08-05 13:24:16.414221', 16, NULL, 'operating', NULL),
(6243, 250.00, 'advertising', '2026-07-01', 'excel-import-2026|Conroe|07|Advertising / Leasing', '2026-08-05 13:24:16.664347', 16, NULL, 'operating', NULL),
(6244, 90.85, 'transportation', '2026-07-01', 'excel-import-2026|Conroe|07|Transportation Cost', '2026-08-05 13:24:16.916397', 16, NULL, 'operating', NULL),
(6245, 200.00, 'supplies', '2026-07-01', 'excel-import-2026|Conroe|07|Supplies & Materials', '2026-08-05 13:24:17.168423', 16, NULL, 'operating', NULL),
(6246, 83.17, 'utilities', '2026-07-01', 'excel-import-2026|Conroe|07|Electricity', '2026-08-05 13:24:17.423110', 16, NULL, 'operating', NULL),
(6247, 50.00, 'utilities', '2026-07-01', 'excel-import-2026|Conroe|07|Water', '2026-08-05 13:24:17.688668', 16, NULL, 'operating', NULL),
(6248, 133.17, 'utilities', '2026-07-01', 'excel-import-2026|Conroe|07|Utilities (Landlord Paid)', '2026-08-05 13:24:17.940590', 16, NULL, 'operating', NULL),
(6249, 1232.50, 'mortgage_interest', '2026-07-01', 'excel-import-2026|Conroe|07|Mortgage Interest', '2026-08-05 13:24:18.188537', 16, NULL, 'admin_only', NULL),
(6250, 1705.47, 'other', '2026-08-01', 'excel-import-2026|Conroe|08|__SUMMARY__', '2026-08-05 13:24:18.437152', 16, NULL, 'operating', NULL),
(6251, 100.00, 'management', '2026-08-01', 'excel-import-2026|Conroe|08|Property Management Fees', '2026-08-05 13:24:18.691213', 16, NULL, 'operating', NULL),
(6252, 453.67, 'taxes', '2026-08-01', 'excel-import-2026|Conroe|08|Property Taxes', '2026-08-05 13:24:18.942991', 16, NULL, 'operating', NULL),
(6253, 183.83, 'insurance', '2026-08-01', 'excel-import-2026|Conroe|08|Insurance', '2026-08-05 13:24:19.200020', 16, NULL, 'operating', NULL),
(6254, 37.50, 'hoa', '2026-08-01', 'excel-import-2026|Conroe|08|HOA Fees', '2026-08-05 13:24:19.448102', 16, NULL, 'operating', NULL),
(6255, 250.00, 'advertising', '2026-08-01', 'excel-import-2026|Conroe|08|Advertising / Leasing', '2026-08-05 13:24:19.704165', 16, NULL, 'operating', NULL),
(6256, 242.27, 'transportation', '2026-08-01', 'excel-import-2026|Conroe|08|Transportation Cost', '2026-08-05 13:24:19.957596', 16, NULL, 'operating', NULL),
(6257, 200.00, 'supplies', '2026-08-01', 'excel-import-2026|Conroe|08|Supplies & Materials', '2026-08-05 13:24:20.221873', 16, NULL, 'operating', NULL),
(6258, 108.20, 'utilities', '2026-08-01', 'excel-import-2026|Conroe|08|Electricity', '2026-08-05 13:24:20.473032', 16, NULL, 'operating', NULL),
(6259, 130.00, 'utilities', '2026-08-01', 'excel-import-2026|Conroe|08|Water', '2026-08-05 13:24:20.725297', 16, NULL, 'operating', NULL),
(6260, 238.20, 'utilities', '2026-08-01', 'excel-import-2026|Conroe|08|Utilities (Landlord Paid)', '2026-08-05 13:24:20.973582', 16, NULL, 'operating', NULL),
(6261, 1232.50, 'mortgage_interest', '2026-08-01', 'excel-import-2026|Conroe|08|Mortgage Interest', '2026-08-05 13:24:21.225975', 16, NULL, 'admin_only', NULL),
(6262, 1627.50, 'other', '2026-09-01', 'excel-import-2026|Conroe|09|__SUMMARY__', '2026-08-05 13:24:21.479330', 16, NULL, 'operating', NULL),
(6263, 100.00, 'management', '2026-09-01', 'excel-import-2026|Conroe|09|Property Management Fees', '2026-08-05 13:24:21.732327', 16, NULL, 'operating', NULL),
(6264, 453.67, 'taxes', '2026-09-01', 'excel-import-2026|Conroe|09|Property Taxes', '2026-08-05 13:24:21.984569', 16, NULL, 'operating', NULL),
(6265, 183.83, 'insurance', '2026-09-01', 'excel-import-2026|Conroe|09|Insurance', '2026-08-05 13:24:22.231593', 16, NULL, 'operating', NULL),
(6266, 37.50, 'hoa', '2026-09-01', 'excel-import-2026|Conroe|09|HOA Fees', '2026-08-05 13:24:22.494493', 16, NULL, 'operating', NULL),
(6267, 250.00, 'advertising', '2026-09-01', 'excel-import-2026|Conroe|09|Advertising / Leasing', '2026-08-05 13:24:22.746215', 16, NULL, 'operating', NULL),
(6268, 242.27, 'transportation', '2026-09-01', 'excel-import-2026|Conroe|09|Transportation Cost', '2026-08-05 13:24:22.994876', 16, NULL, 'operating', NULL),
(6269, 200.00, 'supplies', '2026-09-01', 'excel-import-2026|Conroe|09|Supplies & Materials', '2026-08-05 13:24:23.247420', 16, NULL, 'operating', NULL),
(6270, 118.66, 'utilities', '2026-09-01', 'excel-import-2026|Conroe|09|Electricity', '2026-08-05 13:24:23.509868', 16, NULL, 'operating', NULL),
(6271, 41.57, 'utilities', '2026-09-01', 'excel-import-2026|Conroe|09|Water', '2026-08-05 13:24:23.770259', 16, NULL, 'operating', NULL),
(6272, 160.23, 'utilities', '2026-09-01', 'excel-import-2026|Conroe|09|Utilities (Landlord Paid)', '2026-08-05 13:24:24.019451', 16, NULL, 'operating', NULL),
(6273, 1232.50, 'mortgage_interest', '2026-09-01', 'excel-import-2026|Conroe|09|Mortgage Interest', '2026-08-05 13:24:24.267126', 16, NULL, 'admin_only', NULL),
(6274, 1980.85, 'other', '2026-10-01', 'excel-import-2026|Conroe|10|__SUMMARY__', '2026-08-05 13:24:24.525944', 16, NULL, 'operating', NULL),
(6275, 100.00, 'management', '2026-10-01', 'excel-import-2026|Conroe|10|Property Management Fees', '2026-08-05 13:24:24.778105', 16, NULL, 'operating', NULL),
(6276, 500.00, 'maintenance', '2026-10-01', 'excel-import-2026|Conroe|10|Repairs & Maintenance', '2026-08-05 13:24:25.028577', 16, NULL, 'operating', NULL),
(6277, 453.67, 'taxes', '2026-10-01', 'excel-import-2026|Conroe|10|Property Taxes', '2026-08-05 13:24:25.283119', 16, NULL, 'operating', NULL),
(6278, 183.83, 'insurance', '2026-10-01', 'excel-import-2026|Conroe|10|Insurance', '2026-08-05 13:24:25.528901', 16, NULL, 'operating', NULL),
(6279, 37.50, 'hoa', '2026-10-01', 'excel-import-2026|Conroe|10|HOA Fees', '2026-08-05 13:24:25.782693', 16, NULL, 'operating', NULL),
(6280, 150.00, 'advertising', '2026-10-01', 'excel-import-2026|Conroe|10|Advertising / Leasing', '2026-08-05 13:24:26.031647', 16, NULL, 'operating', NULL),
(6281, 242.27, 'transportation', '2026-10-01', 'excel-import-2026|Conroe|10|Transportation Cost', '2026-08-05 13:24:26.280246', 16, NULL, 'operating', NULL),
(6282, 200.00, 'supplies', '2026-10-01', 'excel-import-2026|Conroe|10|Supplies & Materials', '2026-08-05 13:24:26.533203', 16, NULL, 'operating', NULL),
(6283, 19.22, 'utilities', '2026-10-01', 'excel-import-2026|Conroe|10|Electricity', '2026-08-05 13:24:26.784112', 16, NULL, 'operating', NULL),
(6284, 94.36, 'utilities', '2026-10-01', 'excel-import-2026|Conroe|10|Water', '2026-08-05 13:24:27.035215', 16, NULL, 'operating', NULL),
(6285, 113.58, 'utilities', '2026-10-01', 'excel-import-2026|Conroe|10|Utilities (Landlord Paid)', '2026-08-05 13:24:27.293764', 16, NULL, 'operating', NULL),
(6286, 1232.50, 'mortgage_interest', '2026-10-01', 'excel-import-2026|Conroe|10|Mortgage Interest', '2026-08-05 13:24:27.542518', 16, NULL, 'admin_only', NULL),
(6287, 2128.85, 'other', '2026-11-01', 'excel-import-2026|Conroe|11|__SUMMARY__', '2026-08-05 13:24:27.796751', 16, NULL, 'operating', NULL),
(6288, 100.00, 'management', '2026-11-01', 'excel-import-2026|Conroe|11|Property Management Fees', '2026-08-05 13:24:28.048572', 16, NULL, 'operating', NULL),
(6289, 650.00, 'maintenance', '2026-11-01', 'excel-import-2026|Conroe|11|Repairs & Maintenance', '2026-08-05 13:24:28.302938', 16, NULL, 'operating', NULL),
(6290, 453.67, 'taxes', '2026-11-01', 'excel-import-2026|Conroe|11|Property Taxes', '2026-08-05 13:24:28.572701', 16, NULL, 'operating', NULL),
(6291, 183.83, 'insurance', '2026-11-01', 'excel-import-2026|Conroe|11|Insurance', '2026-08-05 13:24:28.824284', 16, NULL, 'operating', NULL),
(6292, 37.50, 'hoa', '2026-11-01', 'excel-import-2026|Conroe|11|HOA Fees', '2026-08-05 13:24:29.084043', 16, NULL, 'operating', NULL),
(6293, 150.00, 'advertising', '2026-11-01', 'excel-import-2026|Conroe|11|Advertising / Leasing', '2026-08-05 13:24:29.334298', 16, NULL, 'operating', NULL),
(6294, 242.27, 'transportation', '2026-11-01', 'excel-import-2026|Conroe|11|Transportation Cost', '2026-08-05 13:24:29.583776', 16, NULL, 'operating', NULL),
(6295, 150.00, 'supplies', '2026-11-01', 'excel-import-2026|Conroe|11|Supplies & Materials', '2026-08-05 13:24:29.849721', 16, NULL, 'operating', NULL),
(6296, 17.22, 'utilities', '2026-11-01', 'excel-import-2026|Conroe|11|Electricity', '2026-08-05 13:24:30.106588', 16, NULL, 'operating', NULL),
(6297, 144.36, 'utilities', '2026-11-01', 'excel-import-2026|Conroe|11|Water', '2026-08-05 13:24:30.357751', 16, NULL, 'operating', NULL),
(6298, 161.58, 'utilities', '2026-11-01', 'excel-import-2026|Conroe|11|Utilities (Landlord Paid)', '2026-08-05 13:24:30.608523', 16, NULL, 'operating', NULL),
(6299, 1232.50, 'mortgage_interest', '2026-11-01', 'excel-import-2026|Conroe|11|Mortgage Interest', '2026-08-05 13:24:30.856796', 16, NULL, 'admin_only', NULL),
(6300, 1262.31, 'other', '2026-12-01', 'excel-import-2026|Conroe|12|__SUMMARY__', '2026-08-05 13:24:31.107597', 16, NULL, 'operating', NULL),
(6301, 100.00, 'management', '2026-12-01', 'excel-import-2026|Conroe|12|Property Management Fees', '2026-08-05 13:24:31.356758', 16, NULL, 'operating', NULL),
(6302, 200.00, 'maintenance', '2026-12-01', 'excel-import-2026|Conroe|12|Repairs & Maintenance', '2026-08-05 13:24:31.608878', 16, NULL, 'operating', NULL),
(6303, 453.67, 'taxes', '2026-12-01', 'excel-import-2026|Conroe|12|Property Taxes', '2026-08-05 13:24:31.869152', 16, NULL, 'operating', NULL),
(6304, 183.83, 'insurance', '2026-12-01', 'excel-import-2026|Conroe|12|Insurance', '2026-08-05 13:24:32.128264', 16, NULL, 'operating', NULL),
(6305, 37.50, 'hoa', '2026-12-01', 'excel-import-2026|Conroe|12|HOA Fees', '2026-08-05 13:24:32.385197', 16, NULL, 'operating', NULL),
(6306, 15.14, 'transportation', '2026-12-01', 'excel-import-2026|Conroe|12|Transportation Cost', '2026-08-05 13:24:32.635472', 16, NULL, 'operating', NULL),
(6307, 150.00, 'supplies', '2026-12-01', 'excel-import-2026|Conroe|12|Supplies & Materials', '2026-08-05 13:24:32.885532', 16, NULL, 'operating', NULL),
(6308, 17.53, 'utilities', '2026-12-01', 'excel-import-2026|Conroe|12|Electricity', '2026-08-05 13:24:33.138939', 16, NULL, 'operating', NULL),
(6309, 104.64, 'utilities', '2026-12-01', 'excel-import-2026|Conroe|12|Water', '2026-08-05 13:24:33.390690', 16, NULL, 'operating', NULL),
(6310, 122.17, 'utilities', '2026-12-01', 'excel-import-2026|Conroe|12|Utilities (Landlord Paid)', '2026-08-05 13:24:33.643104', 16, NULL, 'operating', NULL),
(6311, 1232.50, 'mortgage_interest', '2026-12-01', 'excel-import-2026|Conroe|12|Mortgage Interest', '2026-08-05 13:24:33.891258', 16, NULL, 'admin_only', NULL),
(6312, 1161.65, 'other', '2025-01-01', 'excel-import-2025|Ave_H|01|__SUMMARY__', '2026-08-05 13:24:39.215306', 18, NULL, 'operating', NULL),
(6313, 30.00, 'management', '2025-01-01', 'excel-import-2025|Ave_H|01|Property Management Fees - Unit 1', '2026-08-05 13:24:39.481427', 18, NULL, 'operating', 171),
(6314, 175.00, 'maintenance', '2025-01-01', 'excel-import-2025|Ave_H|01|Repairs & Maintenance - Unit 1', '2026-08-05 13:24:39.734177', 18, NULL, 'operating', 171),
(6315, 60.00, 'cleaning', '2025-01-01', 'excel-import-2025|Ave_H|01|Cleaning Fees - Unit 1', '2026-08-05 13:24:39.982331', 18, NULL, 'operating', 171),
(6316, 50.00, 'supplies', '2025-01-01', 'excel-import-2025|Ave_H|01|Supplies & Materials - Unit 1', '2026-08-05 13:24:40.230416', 18, NULL, 'operating', 171),
(6317, 148.69, 'utilities', '2025-01-01', 'excel-import-2025|Ave_H|01|Electricity - Unit 1', '2026-08-05 13:24:40.494401', 18, NULL, 'operating', 171),
(6318, 137.35, 'utilities', '2025-01-01', 'excel-import-2025|Ave_H|01|Water - Unit 1', '2026-08-05 13:24:40.747553', 18, NULL, 'operating', 171),
(6319, 23.55, 'utilities', '2025-01-01', 'excel-import-2025|Ave_H|01|Internet - Unit 1', '2026-08-05 13:24:40.999983', 18, NULL, 'operating', 171),
(6320, 30.00, 'management', '2025-01-01', 'excel-import-2025|Ave_H|01|Property Management Fees - Unit 2', '2026-08-05 13:24:41.253335', 18, NULL, 'operating', 171),
(6321, 175.00, 'maintenance', '2025-01-01', 'excel-import-2025|Ave_H|01|Repairs & Maintenance - Unit 2', '2026-08-05 13:24:41.509595', 18, NULL, 'operating', 171),
(6322, 60.00, 'cleaning', '2025-01-01', 'excel-import-2025|Ave_H|01|Cleaning Fees - Unit 2', '2026-08-05 13:24:41.761228', 18, NULL, 'operating', 171),
(6323, 50.00, 'supplies', '2025-01-01', 'excel-import-2025|Ave_H|01|Supplies & Materials - Unit 2', '2026-08-05 13:24:42.008757', 18, NULL, 'operating', 171),
(6324, 125.46, 'utilities', '2025-01-01', 'excel-import-2025|Ave_H|01|Electricity - Unit 2', '2026-08-05 13:24:42.260369', 18, NULL, 'operating', 171),
(6325, 43.05, 'utilities', '2025-01-01', 'excel-import-2025|Ave_H|01|Water - Unit 2', '2026-08-05 13:24:42.518347', 18, NULL, 'operating', 171),
(6326, 23.55, 'utilities', '2025-01-01', 'excel-import-2025|Ave_H|01|Internet - Unit 2', '2026-08-05 13:24:42.770147', 18, NULL, 'operating', 171),
(6327, 30.00, 'management', '2025-01-01', 'excel-import-2025|Ave_H|01|Property Management Fees - Unit 4', '2026-08-05 13:24:43.024728', 18, NULL, 'operating', 174),
(6328, 1100.86, 'other', '2025-02-01', 'excel-import-2025|Ave_H|02|__SUMMARY__', '2026-08-05 13:24:44.039312', 18, NULL, 'operating', NULL),
(6329, 40.00, 'management', '2025-02-01', 'excel-import-2025|Ave_H|02|Property Management Fees - Unit 1', '2026-08-05 13:24:44.288998', 18, NULL, 'operating', 171),
(6330, 300.00, 'cleaning', '2025-02-01', 'excel-import-2025|Ave_H|02|Cleaning Fees - Unit 1', '2026-08-05 13:24:44.544649', 18, NULL, 'operating', 171),
(6331, 50.00, 'supplies', '2025-02-01', 'excel-import-2025|Ave_H|02|Supplies & Materials - Unit 1', '2026-08-05 13:24:44.794828', 18, NULL, 'operating', 171),
(6332, 100.11, 'utilities', '2025-02-01', 'excel-import-2025|Ave_H|02|Electricity - Unit 1', '2026-08-05 13:24:45.055402', 18, NULL, 'operating', 171),
(6333, 34.65, 'utilities', '2025-02-01', 'excel-import-2025|Ave_H|02|Water - Unit 1', '2026-08-05 13:24:45.304713', 18, NULL, 'operating', 171),
(6334, 23.55, 'utilities', '2025-02-01', 'excel-import-2025|Ave_H|02|Internet - Unit 1', '2026-08-05 13:24:45.554224', 18, NULL, 'operating', 171),
(6335, 40.00, 'management', '2025-02-01', 'excel-import-2025|Ave_H|02|Property Management Fees - Unit 2', '2026-08-05 13:24:45.803126', 18, NULL, 'operating', 171),
(6336, 240.00, 'cleaning', '2025-02-01', 'excel-import-2025|Ave_H|02|Cleaning Fees - Unit 2', '2026-08-05 13:24:46.053972', 18, NULL, 'operating', 171),
(6337, 50.00, 'supplies', '2025-02-01', 'excel-import-2025|Ave_H|02|Supplies & Materials - Unit 2', '2026-08-05 13:24:46.303806', 18, NULL, 'operating', 171),
(6338, 133.82, 'utilities', '2025-02-01', 'excel-import-2025|Ave_H|02|Electricity - Unit 2', '2026-08-05 13:24:46.552857', 18, NULL, 'operating', 171),
(6339, 35.18, 'utilities', '2025-02-01', 'excel-import-2025|Ave_H|02|Water - Unit 2', '2026-08-05 13:24:46.809462', 18, NULL, 'operating', 171),
(6340, 23.55, 'utilities', '2025-02-01', 'excel-import-2025|Ave_H|02|Internet - Unit 2', '2026-08-05 13:24:47.061962', 18, NULL, 'operating', 171),
(6341, 30.00, 'management', '2025-02-01', 'excel-import-2025|Ave_H|02|Property Management Fees - Unit 4', '2026-08-05 13:24:47.314048', 18, NULL, 'operating', 174),
(6342, 1361.86, 'other', '2025-03-01', 'excel-import-2025|Ave_H|03|__SUMMARY__', '2026-08-05 13:24:48.086548', 18, NULL, 'operating', NULL),
(6343, 40.00, 'management', '2025-03-01', 'excel-import-2025|Ave_H|03|Property Management Fees - Unit 1', '2026-08-05 13:24:48.338211', 18, NULL, 'operating', 171),
(6344, 240.00, 'cleaning', '2025-03-01', 'excel-import-2025|Ave_H|03|Cleaning Fees - Unit 1', '2026-08-05 13:24:48.588996', 18, NULL, 'operating', 171),
(6345, 50.00, 'supplies', '2025-03-01', 'excel-import-2025|Ave_H|03|Supplies & Materials - Unit 1', '2026-08-05 13:24:48.847088', 18, NULL, 'operating', 171),
(6346, 134.42, 'utilities', '2025-03-01', 'excel-import-2025|Ave_H|03|Electricity - Unit 1', '2026-08-05 13:24:49.099374', 18, NULL, 'operating', 171),
(6347, 87.52, 'utilities', '2025-03-01', 'excel-import-2025|Ave_H|03|Water - Unit 1', '2026-08-05 13:24:49.352033', 18, NULL, 'operating', 171),
(6348, 23.55, 'utilities', '2025-03-01', 'excel-import-2025|Ave_H|03|Internet - Unit 1', '2026-08-05 13:24:49.601642', 18, NULL, 'operating', 171),
(6349, 40.00, 'management', '2025-03-01', 'excel-import-2025|Ave_H|03|Property Management Fees - Unit 2', '2026-08-05 13:24:49.866352', 18, NULL, 'operating', 171),
(6350, 240.00, 'cleaning', '2025-03-01', 'excel-import-2025|Ave_H|03|Cleaning Fees - Unit 2', '2026-08-05 13:24:50.141564', 18, NULL, 'operating', 171),
(6351, 50.00, 'supplies', '2025-03-01', 'excel-import-2025|Ave_H|03|Supplies & Materials - Unit 2', '2026-08-05 13:24:50.393150', 18, NULL, 'operating', 171),
(6352, 158.91, 'utilities', '2025-03-01', 'excel-import-2025|Ave_H|03|Electricity - Unit 2', '2026-08-05 13:24:50.651139', 18, NULL, 'operating', 171),
(6353, 70.36, 'utilities', '2025-03-01', 'excel-import-2025|Ave_H|03|Water - Unit 2', '2026-08-05 13:24:50.904495', 18, NULL, 'operating', 171),
(6354, 23.55, 'utilities', '2025-03-01', 'excel-import-2025|Ave_H|03|Internet - Unit 2', '2026-08-05 13:24:51.163331', 18, NULL, 'operating', 171),
(6355, 40.00, 'management', '2025-03-01', 'excel-import-2025|Ave_H|03|Property Management Fees - Unit 3', '2026-08-05 13:24:51.412386', 18, NULL, 'operating', 172),
(6356, 60.00, 'cleaning', '2025-03-01', 'excel-import-2025|Ave_H|03|Cleaning Fees - Unit 3', '2026-08-05 13:24:51.659561', 18, NULL, 'operating', 172),
(6357, 50.00, 'supplies', '2025-03-01', 'excel-import-2025|Ave_H|03|Supplies & Materials - Unit 3', '2026-08-05 13:24:51.908458', 18, NULL, 'operating', 172),
(6358, 23.55, 'utilities', '2025-03-01', 'excel-import-2025|Ave_H|03|Internet - Unit 3', '2026-08-05 13:24:52.157197', 18, NULL, 'operating', 172),
(6359, 30.00, 'management', '2025-03-01', 'excel-import-2025|Ave_H|03|Property Management Fees - Unit 4', '2026-08-05 13:24:52.405619', 18, NULL, 'operating', 174),
(6360, 1848.84, 'other', '2025-04-01', 'excel-import-2025|Ave_H|04|__SUMMARY__', '2026-08-05 13:24:53.175568', 18, NULL, 'operating', NULL),
(6361, 40.00, 'management', '2025-04-01', 'excel-import-2025|Ave_H|04|Property Management Fees - Unit 1', '2026-08-05 13:24:53.432905', 18, NULL, 'operating', 171),
(6362, 300.00, 'cleaning', '2025-04-01', 'excel-import-2025|Ave_H|04|Cleaning Fees - Unit 1', '2026-08-05 13:24:53.682475', 18, NULL, 'operating', 171),
(6363, 50.00, 'supplies', '2025-04-01', 'excel-import-2025|Ave_H|04|Supplies & Materials - Unit 1', '2026-08-05 13:24:53.936967', 18, NULL, 'operating', 171),
(6364, 129.42, 'utilities', '2025-04-01', 'excel-import-2025|Ave_H|04|Electricity - Unit 1', '2026-08-05 13:24:54.194236', 18, NULL, 'operating', 171),
(6365, 123.44, 'utilities', '2025-04-01', 'excel-import-2025|Ave_H|04|Water - Unit 1', '2026-08-05 13:24:54.449289', 18, NULL, 'operating', 171),
(6366, 23.55, 'utilities', '2025-04-01', 'excel-import-2025|Ave_H|04|Internet - Unit 1', '2026-08-05 13:24:54.702276', 18, NULL, 'operating', 171),
(6367, 40.00, 'management', '2025-04-01', 'excel-import-2025|Ave_H|04|Property Management Fees - Unit 2', '2026-08-05 13:24:54.956201', 18, NULL, 'operating', 171),
(6368, 240.00, 'cleaning', '2025-04-01', 'excel-import-2025|Ave_H|04|Cleaning Fees - Unit 2', '2026-08-05 13:24:55.289413', 18, NULL, 'operating', 171),
(6369, 50.00, 'supplies', '2025-04-01', 'excel-import-2025|Ave_H|04|Supplies & Materials - Unit 2', '2026-08-05 13:24:55.539882', 18, NULL, 'operating', 171),
(6370, 124.20, 'utilities', '2025-04-01', 'excel-import-2025|Ave_H|04|Electricity - Unit 2', '2026-08-05 13:24:55.788233', 18, NULL, 'operating', 171),
(6371, 105.54, 'utilities', '2025-04-01', 'excel-import-2025|Ave_H|04|Water - Unit 2', '2026-08-05 13:24:56.037108', 18, NULL, 'operating', 171),
(6372, 23.55, 'utilities', '2025-04-01', 'excel-import-2025|Ave_H|04|Internet - Unit 2', '2026-08-05 13:24:56.286923', 18, NULL, 'operating', 171),
(6373, 40.00, 'management', '2025-04-01', 'excel-import-2025|Ave_H|04|Property Management Fees - Unit 3', '2026-08-05 13:24:56.539488', 18, NULL, 'operating', 172),
(6374, 240.00, 'cleaning', '2025-04-01', 'excel-import-2025|Ave_H|04|Cleaning Fees - Unit 3', '2026-08-05 13:24:56.792808', 18, NULL, 'operating', 172),
(6375, 50.00, 'supplies', '2025-04-01', 'excel-import-2025|Ave_H|04|Supplies & Materials - Unit 3', '2026-08-05 13:24:57.049887', 18, NULL, 'operating', 172),
(6376, 84.53, 'utilities', '2025-04-01', 'excel-import-2025|Ave_H|04|Electricity - Unit 3', '2026-08-05 13:24:57.299673', 18, NULL, 'operating', 172),
(6377, 131.06, 'utilities', '2025-04-01', 'excel-import-2025|Ave_H|04|Water - Unit 3', '2026-08-05 13:24:57.552644', 18, NULL, 'operating', 172),
(6378, 23.55, 'utilities', '2025-04-01', 'excel-import-2025|Ave_H|04|Internet - Unit 3', '2026-08-05 13:24:57.799624', 18, NULL, 'operating', 172),
(6379, 30.00, 'management', '2025-04-01', 'excel-import-2025|Ave_H|04|Property Management Fees - Unit 4', '2026-08-05 13:24:58.050824', 18, NULL, 'operating', 174),
(6380, 789.97, 'other', '2025-05-01', 'excel-import-2025|Ave_H|05|__SUMMARY__', '2026-08-05 13:24:58.808438', 18, NULL, 'operating', NULL),
(6381, 50.00, 'supplies', '2025-05-01', 'excel-import-2025|Ave_H|05|Supplies & Materials - Unit 1', '2026-08-05 13:24:59.059401', 18, NULL, 'operating', 171),
(6382, 115.94, 'utilities', '2025-05-01', 'excel-import-2025|Ave_H|05|Electricity - Unit 1', '2026-08-05 13:24:59.309242', 18, NULL, 'operating', 171),
(6383, 23.55, 'utilities', '2025-05-01', 'excel-import-2025|Ave_H|05|Internet - Unit 1', '2026-08-05 13:24:59.565353', 18, NULL, 'operating', 171),
(6384, 50.00, 'supplies', '2025-05-01', 'excel-import-2025|Ave_H|05|Supplies & Materials - Unit 2', '2026-08-05 13:24:59.814282', 18, NULL, 'operating', 171),
(6385, 217.71, 'utilities', '2025-05-01', 'excel-import-2025|Ave_H|05|Electricity - Unit 2', '2026-08-05 13:25:00.062794', 18, NULL, 'operating', 171),
(6386, 23.55, 'utilities', '2025-05-01', 'excel-import-2025|Ave_H|05|Internet - Unit 2', '2026-08-05 13:25:00.311012', 18, NULL, 'operating', 171),
(6387, 50.00, 'supplies', '2025-05-01', 'excel-import-2025|Ave_H|05|Supplies & Materials - Unit 3', '2026-08-05 13:25:00.570302', 18, NULL, 'operating', 172),
(6388, 169.52, 'utilities', '2025-05-01', 'excel-import-2025|Ave_H|05|Electricity - Unit 3', '2026-08-05 13:25:00.827023', 18, NULL, 'operating', 172),
(6389, 36.15, 'utilities', '2025-05-01', 'excel-import-2025|Ave_H|05|Water - Unit 3', '2026-08-05 13:25:01.079873', 18, NULL, 'operating', 172),
(6390, 23.55, 'utilities', '2025-05-01', 'excel-import-2025|Ave_H|05|Internet - Unit 3', '2026-08-05 13:25:01.332427', 18, NULL, 'operating', 172),
(6391, 30.00, 'management', '2025-05-01', 'excel-import-2025|Ave_H|05|Property Management Fees - Unit 4', '2026-08-05 13:25:01.579369', 18, NULL, 'operating', 174),
(6392, 640.63, 'other', '2025-06-01', 'excel-import-2025|Ave_H|06|__SUMMARY__', '2026-08-05 13:25:02.335683', 18, NULL, 'operating', NULL),
(6393, 50.00, 'supplies', '2025-06-01', 'excel-import-2025|Ave_H|06|Supplies & Materials - Unit 1', '2026-08-05 13:25:02.587849', 18, NULL, 'operating', 171),
(6394, 237.02, 'utilities', '2025-06-01', 'excel-import-2025|Ave_H|06|Electricity - Unit 1', '2026-08-05 13:25:02.842874', 18, NULL, 'operating', 171),
(6395, 50.00, 'supplies', '2025-06-01', 'excel-import-2025|Ave_H|06|Supplies & Materials - Unit 2', '2026-08-05 13:25:03.094754', 18, NULL, 'operating', 171),
(6396, 227.52, 'utilities', '2025-06-01', 'excel-import-2025|Ave_H|06|Electricity - Unit 2', '2026-08-05 13:25:03.348211', 18, NULL, 'operating', 171),
(6397, 46.09, 'utilities', '2025-06-01', 'excel-import-2025|Ave_H|06|Water - Unit 3', '2026-08-05 13:25:03.598492', 18, NULL, 'operating', 172),
(6398, 30.00, 'management', '2025-06-01', 'excel-import-2025|Ave_H|06|Property Management Fees - Unit 4', '2026-08-05 13:25:03.858873', 18, NULL, 'operating', 174),
(6399, 737.89, 'other', '2025-07-01', 'excel-import-2025|Ave_H|07|__SUMMARY__', '2026-08-05 13:25:04.624943', 18, NULL, 'operating', NULL),
(6400, 50.00, 'supplies', '2025-07-01', 'excel-import-2025|Ave_H|07|Supplies & Materials - Unit 1', '2026-08-05 13:25:04.874783', 18, NULL, 'operating', 171),
(6401, 251.52, 'utilities', '2025-07-01', 'excel-import-2025|Ave_H|07|Electricity - Unit 1', '2026-08-05 13:25:05.138156', 18, NULL, 'operating', 171),
(6402, 50.00, 'supplies', '2025-07-01', 'excel-import-2025|Ave_H|07|Supplies & Materials - Unit 2', '2026-08-05 13:25:05.385461', 18, NULL, 'operating', 171),
(6403, 356.37, 'utilities', '2025-07-01', 'excel-import-2025|Ave_H|07|Electricity - Unit 2', '2026-08-05 13:25:05.639817', 18, NULL, 'operating', 171),
(6404, 30.00, 'management', '2025-07-01', 'excel-import-2025|Ave_H|07|Property Management Fees - Unit 4', '2026-08-05 13:25:05.892665', 18, NULL, 'operating', 174),
(6405, 30.00, 'other', '2025-08-01', 'excel-import-2025|Ave_H|08|__SUMMARY__', '2026-08-05 13:25:06.663670', 18, NULL, 'operating', NULL),
(6406, 30.00, 'management', '2025-08-01', 'excel-import-2025|Ave_H|08|Property Management Fees - Unit 4', '2026-08-05 13:25:06.922285', 18, NULL, 'operating', 174),
(6407, 30.00, 'other', '2025-09-01', 'excel-import-2025|Ave_H|09|__SUMMARY__', '2026-08-05 13:25:07.677739', 18, NULL, 'operating', NULL),
(6408, 30.00, 'management', '2025-09-01', 'excel-import-2025|Ave_H|09|Property Management Fees - Unit 4', '2026-08-05 13:25:07.937338', 18, NULL, 'operating', 174),
(6409, 30.00, 'other', '2025-10-01', 'excel-import-2025|Ave_H|10|__SUMMARY__', '2026-08-05 13:25:08.694216', 18, NULL, 'operating', NULL),
(6410, 30.00, 'management', '2025-10-01', 'excel-import-2025|Ave_H|10|Property Management Fees - Unit 4', '2026-08-05 13:25:08.960323', 18, NULL, 'operating', 174),
(6411, 30.00, 'other', '2025-11-01', 'excel-import-2025|Ave_H|11|__SUMMARY__', '2026-08-05 13:25:09.727205', 18, NULL, 'operating', NULL),
(6412, 30.00, 'management', '2025-11-01', 'excel-import-2025|Ave_H|11|Property Management Fees - Unit 4', '2026-08-05 13:25:09.977095', 18, NULL, 'operating', 174),
(6413, 30.00, 'other', '2025-12-01', 'excel-import-2025|Ave_H|12|__SUMMARY__', '2026-08-05 13:25:10.738886', 18, NULL, 'operating', NULL),
(6414, 30.00, 'management', '2025-12-01', 'excel-import-2025|Ave_H|12|Property Management Fees - Unit 4', '2026-08-05 13:25:10.995060', 18, NULL, 'operating', 174),
(6415, 30.00, 'other', '2026-01-01', 'excel-import-2026|Ave_F|01|__SUMMARY__', '2026-08-05 13:25:15.557475', 20, NULL, 'operating', NULL),
(6416, 30.00, 'management', '2026-01-01', 'excel-import-2026|Ave_F|01|Property Management Fees - Unit 4', '2026-08-05 13:25:15.805699', 20, NULL, 'operating', 178),
(6417, 30.00, 'other', '2026-02-01', 'excel-import-2026|Ave_F|02|__SUMMARY__', '2026-08-05 13:25:16.057048', 20, NULL, 'operating', NULL),
(6418, 30.00, 'management', '2026-02-01', 'excel-import-2026|Ave_F|02|Property Management Fees - Unit 4', '2026-08-05 13:25:16.310286', 20, NULL, 'operating', 178),
(6419, 30.00, 'other', '2026-03-01', 'excel-import-2026|Ave_F|03|__SUMMARY__', '2026-08-05 13:25:16.574295', 20, NULL, 'operating', NULL),
(6420, 30.00, 'management', '2026-03-01', 'excel-import-2026|Ave_F|03|Property Management Fees - Unit 4', '2026-08-05 13:25:16.825296', 20, NULL, 'operating', 178),
(6421, 30.00, 'other', '2026-04-01', 'excel-import-2026|Ave_F|04|__SUMMARY__', '2026-08-05 13:25:17.096245', 20, NULL, 'operating', NULL),
(6422, 30.00, 'management', '2026-04-01', 'excel-import-2026|Ave_F|04|Property Management Fees - Unit 4', '2026-08-05 13:25:17.346291', 20, NULL, 'operating', 178),
(6423, 30.00, 'other', '2026-05-01', 'excel-import-2026|Ave_F|05|__SUMMARY__', '2026-08-05 13:25:17.595484', 20, NULL, 'operating', NULL),
(6424, 30.00, 'management', '2026-05-01', 'excel-import-2026|Ave_F|05|Property Management Fees - Unit 4', '2026-08-05 13:25:17.850123', 20, NULL, 'operating', 178),
(6425, 30.00, 'other', '2026-06-01', 'excel-import-2026|Ave_F|06|__SUMMARY__', '2026-08-05 13:25:18.098563', 20, NULL, 'operating', NULL),
(6426, 30.00, 'management', '2026-06-01', 'excel-import-2026|Ave_F|06|Property Management Fees - Unit 4', '2026-08-05 13:25:18.350604', 20, NULL, 'operating', 178),
(6427, 30.00, 'other', '2026-07-01', 'excel-import-2026|Ave_F|07|__SUMMARY__', '2026-08-05 13:25:18.607555', 20, NULL, 'operating', NULL),
(6428, 30.00, 'management', '2026-07-01', 'excel-import-2026|Ave_F|07|Property Management Fees - Unit 4', '2026-08-05 13:25:18.860154', 20, NULL, 'operating', 178),
(6429, 30.00, 'other', '2026-08-01', 'excel-import-2026|Ave_F|08|__SUMMARY__', '2026-08-05 13:25:19.129729', 20, NULL, 'operating', NULL),
(6430, 30.00, 'management', '2026-08-01', 'excel-import-2026|Ave_F|08|Property Management Fees - Unit 4', '2026-08-05 13:25:19.378510', 20, NULL, 'operating', 178),
(6431, 30.00, 'other', '2026-09-01', 'excel-import-2026|Ave_F|09|__SUMMARY__', '2026-08-05 13:25:19.628255', 20, NULL, 'operating', NULL),
(6432, 30.00, 'management', '2026-09-01', 'excel-import-2026|Ave_F|09|Property Management Fees - Unit 4', '2026-08-05 13:25:19.879742', 20, NULL, 'operating', 178),
(6433, 30.00, 'other', '2026-10-01', 'excel-import-2026|Ave_F|10|__SUMMARY__', '2026-08-05 13:25:20.136339', 20, NULL, 'operating', NULL),
(6434, 30.00, 'management', '2026-10-01', 'excel-import-2026|Ave_F|10|Property Management Fees - Unit 4', '2026-08-05 13:25:20.383804', 20, NULL, 'operating', 178),
(6435, 30.00, 'other', '2026-11-01', 'excel-import-2026|Ave_F|11|__SUMMARY__', '2026-08-05 13:25:20.641682', 20, NULL, 'operating', NULL),
(6436, 30.00, 'management', '2026-11-01', 'excel-import-2026|Ave_F|11|Property Management Fees - Unit 4', '2026-08-05 13:25:20.891659', 20, NULL, 'operating', 178),
(6437, 30.00, 'other', '2026-12-01', 'excel-import-2026|Ave_F|12|__SUMMARY__', '2026-08-05 13:25:21.144251', 20, NULL, 'operating', NULL),
(6438, 30.00, 'management', '2026-12-01', 'excel-import-2026|Ave_F|12|Property Management Fees - Unit 4', '2026-08-05 13:25:21.411719', 20, NULL, 'operating', 178),
(6439, 100.11, 'other', '2026-01-01', 'excel-import-2026|Wooding|01|__SUMMARY__', '2026-08-05 13:25:24.952026', 19, NULL, 'operating', NULL),
(6440, 14.90, 'utilities', '2026-01-01', 'excel-import-2026|Wooding|01|Electricity - Unit 2', '2026-08-05 13:25:25.264713', 19, NULL, 'operating', 165),
(6441, 85.21, 'utilities', '2026-01-01', 'excel-import-2026|Wooding|01|Water - Unit 2', '2026-08-05 13:25:25.530017', 19, NULL, 'operating', 165),
(6442, 65.36, 'other', '2026-02-01', 'excel-import-2026|Wooding|02|__SUMMARY__', '2026-08-05 13:25:25.783323', 19, NULL, 'operating', NULL),
(6443, 21.50, 'utilities', '2026-02-01', 'excel-import-2026|Wooding|02|Electricity - Unit 2', '2026-08-05 13:25:26.036069', 19, NULL, 'operating', 165),
(6444, 43.86, 'utilities', '2026-02-01', 'excel-import-2026|Wooding|02|Water - Unit 2', '2026-08-05 13:25:26.283656', 19, NULL, 'operating', 165),
(6445, 821.97, 'other', '2026-03-01', 'excel-import-2026|Wooding|03|__SUMMARY__', '2026-08-05 13:25:26.532975', 19, NULL, 'operating', NULL),
(6446, 750.00, 'maintenance', '2026-03-01', 'excel-import-2026|Wooding|03|Repairs & Maintenance - Unit 1', '2026-08-05 13:25:26.785866', 19, NULL, 'operating', 164),
(6447, 28.11, 'utilities', '2026-03-01', 'excel-import-2026|Wooding|03|Electricity - Unit 2', '2026-08-05 13:25:27.035173', 19, NULL, 'operating', 165),
(6448, 43.86, 'utilities', '2026-03-01', 'excel-import-2026|Wooding|03|Water - Unit 2', '2026-08-05 13:25:27.285376', 19, NULL, 'operating', 165),
(6449, 502.77, 'other', '2026-04-01', 'excel-import-2026|Wooding|04|__SUMMARY__', '2026-08-05 13:25:27.538244', 19, NULL, 'operating', NULL),
(6450, 40.00, 'management', '2026-04-01', 'excel-import-2026|Wooding|04|Property Management Fees - Unit 2', '2026-08-05 13:25:27.791186', 19, NULL, 'operating', 165),
(6451, 160.00, 'cleaning', '2026-04-01', 'excel-import-2026|Wooding|04|Cleaning Fees - Unit 2', '2026-08-05 13:25:28.039293', 19, NULL, 'operating', 165),
(6452, 50.00, 'supplies', '2026-04-01', 'excel-import-2026|Wooding|04|Supplies & Materials - Unit 2', '2026-08-05 13:25:28.287602', 19, NULL, 'operating', 165),
(6453, 84.53, 'utilities', '2026-04-01', 'excel-import-2026|Wooding|04|Electricity - Unit 2', '2026-08-05 13:25:28.540314', 19, NULL, 'operating', 165),
(6454, 55.24, 'utilities', '2026-04-01', 'excel-import-2026|Wooding|04|Water - Unit 2', '2026-08-05 13:25:28.789683', 19, NULL, 'operating', 165),
(6455, 41.52, 'utilities', '2026-04-01', 'excel-import-2026|Wooding|04|Internet - Unit 2', '2026-08-05 13:25:29.054316', 19, NULL, 'operating', 165),
(6456, 71.48, 'utilities', '2026-04-01', 'excel-import-2026|Wooding|04|Water - Unit 3', '2026-08-05 13:25:29.308560', 19, NULL, 'operating', 166),
(6457, 529.88, 'other', '2026-05-01', 'excel-import-2026|Wooding|05|__SUMMARY__', '2026-08-05 13:25:29.558435', 19, NULL, 'operating', NULL),
(6458, 50.00, 'supplies', '2026-05-01', 'excel-import-2026|Wooding|05|Supplies & Materials - Unit 2', '2026-08-05 13:25:29.809393', 19, NULL, 'operating', 165),
(6459, 179.48, 'utilities', '2026-05-01', 'excel-import-2026|Wooding|05|Electricity - Unit 2', '2026-08-05 13:25:30.063775', 19, NULL, 'operating', 165),
(6460, 150.08, 'utilities', '2026-05-01', 'excel-import-2026|Wooding|05|Water - Unit 2', '2026-08-05 13:25:30.329951', 19, NULL, 'operating', 165),
(6461, 150.32, 'utilities', '2026-05-01', 'excel-import-2026|Wooding|05|Internet - Unit 2', '2026-08-05 13:25:30.580477', 19, NULL, 'operating', 165),
(6462, 361.43, 'other', '2026-06-01', 'excel-import-2026|Wooding|06|__SUMMARY__', '2026-08-05 13:25:30.831453', 19, NULL, 'operating', NULL),
(6463, 50.00, 'supplies', '2026-06-01', 'excel-import-2026|Wooding|06|Supplies & Materials - Unit 2', '2026-08-05 13:25:31.085973', 19, NULL, 'operating', 165),
(6464, 211.35, 'utilities', '2026-06-01', 'excel-import-2026|Wooding|06|Electricity - Unit 2', '2026-08-05 13:25:31.337487', 19, NULL, 'operating', 165),
(6465, 100.08, 'utilities', '2026-06-01', 'excel-import-2026|Wooding|06|Water - Unit 2', '2026-08-05 13:25:31.591739', 19, NULL, 'operating', 165),
(6466, 372.60, 'other', '2026-07-01', 'excel-import-2026|Wooding|07|__SUMMARY__', '2026-08-05 13:25:31.839258', 19, NULL, 'operating', NULL),
(6467, 50.00, 'supplies', '2026-07-01', 'excel-import-2026|Wooding|07|Supplies & Materials - Unit 2', '2026-08-05 13:25:32.093140', 19, NULL, 'operating', 165),
(6468, 222.52, 'utilities', '2026-07-01', 'excel-import-2026|Wooding|07|Electricity - Unit 2', '2026-08-05 13:25:32.341296', 19, NULL, 'operating', 165),
(6469, 100.08, 'utilities', '2026-07-01', 'excel-import-2026|Wooding|07|Water - Unit 2', '2026-08-05 13:25:32.594259', 19, NULL, 'operating', 165),
(6470, 0.00, 'other', '2026-08-01', 'excel-import-2026|Wooding|08|__SUMMARY__', '2026-08-05 13:25:32.846694', 19, NULL, 'operating', NULL),
(6471, 0.00, 'other', '2026-09-01', 'excel-import-2026|Wooding|09|__SUMMARY__', '2026-08-05 13:25:33.099753', 19, NULL, 'operating', NULL),
(6472, 0.00, 'other', '2026-10-01', 'excel-import-2026|Wooding|10|__SUMMARY__', '2026-08-05 13:25:33.348688', 19, NULL, 'operating', NULL),
(6473, 0.00, 'other', '2026-11-01', 'excel-import-2026|Wooding|11|__SUMMARY__', '2026-08-05 13:25:33.599237', 19, NULL, 'operating', NULL),
(6474, 0.00, 'other', '2026-12-01', 'excel-import-2026|Wooding|12|__SUMMARY__', '2026-08-05 13:25:33.854295', 19, NULL, 'operating', NULL),
(6475, 30.00, 'other', '2026-01-01', 'excel-import-2026|70th|01|__SUMMARY__', '2026-08-05 13:25:38.210122', 26, NULL, 'operating', NULL),
(6476, 30.00, 'management', '2026-01-01', 'excel-import-2026|70th|01|Property Management Fees - Unit 4', '2026-08-05 13:25:38.467607', 26, NULL, 'operating', 181),
(6477, 30.00, 'other', '2026-02-01', 'excel-import-2026|70th|02|__SUMMARY__', '2026-08-05 13:25:39.216017', 26, NULL, 'operating', NULL),
(6478, 30.00, 'management', '2026-02-01', 'excel-import-2026|70th|02|Property Management Fees - Unit 4', '2026-08-05 13:25:39.469751', 26, NULL, 'operating', 181),
(6479, 30.00, 'other', '2026-03-01', 'excel-import-2026|70th|03|__SUMMARY__', '2026-08-05 13:25:40.244154', 26, NULL, 'operating', NULL),
(6480, 30.00, 'management', '2026-03-01', 'excel-import-2026|70th|03|Property Management Fees - Unit 4', '2026-08-05 13:25:40.497893', 26, NULL, 'operating', 181),
(6481, 30.00, 'other', '2026-04-01', 'excel-import-2026|70th|04|__SUMMARY__', '2026-08-05 13:25:41.248912', 26, NULL, 'operating', NULL),
(6482, 30.00, 'management', '2026-04-01', 'excel-import-2026|70th|04|Property Management Fees - Unit 4', '2026-08-05 13:25:41.498063', 26, NULL, 'operating', 181),
(6483, 30.00, 'other', '2026-05-01', 'excel-import-2026|70th|05|__SUMMARY__', '2026-08-05 13:25:42.260539', 26, NULL, 'operating', NULL),
(6484, 30.00, 'management', '2026-05-01', 'excel-import-2026|70th|05|Property Management Fees - Unit 4', '2026-08-05 13:25:42.516707', 26, NULL, 'operating', 181),
(6485, 30.00, 'other', '2026-06-01', 'excel-import-2026|70th|06|__SUMMARY__', '2026-08-05 13:25:43.266133', 26, NULL, 'operating', NULL),
(6486, 30.00, 'management', '2026-06-01', 'excel-import-2026|70th|06|Property Management Fees - Unit 4', '2026-08-05 13:25:43.515153', 26, NULL, 'operating', 181),
(6487, 30.00, 'other', '2026-07-01', 'excel-import-2026|70th|07|__SUMMARY__', '2026-08-05 13:25:44.277588', 26, NULL, 'operating', NULL),
(6488, 30.00, 'management', '2026-07-01', 'excel-import-2026|70th|07|Property Management Fees - Unit 4', '2026-08-05 13:25:44.526355', 26, NULL, 'operating', 181),
(6489, 30.00, 'other', '2026-08-01', 'excel-import-2026|70th|08|__SUMMARY__', '2026-08-05 13:25:45.278206', 26, NULL, 'operating', NULL),
(6490, 30.00, 'management', '2026-08-01', 'excel-import-2026|70th|08|Property Management Fees - Unit 4', '2026-08-05 13:25:45.529456', 26, NULL, 'operating', 181),
(6491, 30.00, 'other', '2026-09-01', 'excel-import-2026|70th|09|__SUMMARY__', '2026-08-05 13:25:45.783812', 26, NULL, 'operating', NULL),
(6492, 30.00, 'management', '2026-09-01', 'excel-import-2026|70th|09|Property Management Fees - Unit 4', '2026-08-05 13:25:46.036375', 26, NULL, 'operating', 181),
(6493, 30.00, 'other', '2026-10-01', 'excel-import-2026|70th|10|__SUMMARY__', '2026-08-05 13:25:46.794242', 26, NULL, 'operating', NULL),
(6494, 30.00, 'management', '2026-10-01', 'excel-import-2026|70th|10|Property Management Fees - Unit 4', '2026-08-05 13:25:47.066148', 26, NULL, 'operating', 181),
(6495, 30.00, 'other', '2026-11-01', 'excel-import-2026|70th|11|__SUMMARY__', '2026-08-05 13:25:47.820150', 26, NULL, 'operating', NULL),
(6496, 30.00, 'management', '2026-11-01', 'excel-import-2026|70th|11|Property Management Fees - Unit 4', '2026-08-05 13:25:48.072560', 26, NULL, 'operating', 181),
(6497, 30.00, 'other', '2026-12-01', 'excel-import-2026|70th|12|__SUMMARY__', '2026-08-05 13:25:48.839607', 26, NULL, 'operating', NULL),
(6498, 30.00, 'management', '2026-12-01', 'excel-import-2026|70th|12|Property Management Fees - Unit 4', '2026-08-05 13:25:49.090057', 26, NULL, 'operating', 181),
(6499, 50.00, 'legal', '2026-08-06', 'Legal & Professional Fees · Unit: Unit 1 (The Hideaway) 7425', '2026-08-06 13:20:48.743511', 18, 4, 'operating', 171),
(6500, 100.00, 'utilities', '2026-08-07', 'Electricity · Unit: Unit C', '2026-08-07 11:24:48.806238', 17, 2, 'operating', 3);

-- --------------------------------------------------------

--
-- Table structure for table `api_payment`
--

CREATE TABLE `api_payment` (
  `id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `status` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `method` varchar(50) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `tenant_id` bigint(20) NOT NULL,
  `proof_of_payment_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`proof_of_payment_files`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_payment`
--

INSERT INTO `api_payment` (`id`, `amount`, `date`, `status`, `type`, `method`, `reference`, `tenant_id`, `proof_of_payment_files`) VALUES
(1, 10.00, '2026-04-02', 'Pending', 'Late Fee', 'Adjustment', 'Adjustment: Late Fee (Charge)', 1, '[]'),
(2, 20.00, '2026-04-02', 'Pending', 'Late Fee', 'Adjustment', 'Adjustment: Late Fee (Charge)', 1, '[]'),
(3, 50.00, '2026-04-02', 'Pending', 'Late Fee', 'Adjustment', 'Adjustment: Late Fee (Charge)', 1, '[]'),
(4, 10.00, '2026-04-02', 'Pending', 'Late Fee', 'Adjustment', 'Adjustment: Late Fee (Charge)', 1, '[]'),
(5, 1100.00, '2026-04-02', 'Paid', 'Rent', 'Zelle', NULL, 1, '[{\"path\": \"media/payments/tenant_1/proof_20260402_132950_TestApp_mr4dfg\", \"size\": 15484, \"filename\": \"TestApp.pdf\", \"uploaded_at\": \"2026-04-02T13:29:51.930264\"}]'),
(579, 2900.00, '2026-01-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-01-rent', 3, '[]'),
(580, 1800.00, '2026-01-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-01-door-1-rent', 3, '[]'),
(581, 1500.00, '2026-01-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-01-door-2-rent', 3, '[]'),
(582, 1319.00, '2026-01-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-01-door-3-rent', 3, '[]'),
(583, 1100.00, '2026-01-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-01-door-4-rent', 3, '[]'),
(584, 3550.03, '2026-02-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-02-rent', 3, '[]'),
(585, 1750.00, '2026-02-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-02-door-1-rent', 3, '[]'),
(586, 700.03, '2026-02-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-02-door-2-rent', 3, '[]'),
(587, 1319.00, '2026-02-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-02-door-3-rent', 3, '[]'),
(588, 1100.00, '2026-02-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-02-door-4-rent', 3, '[]'),
(589, 4169.00, '2026-03-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-03-rent', 3, '[]'),
(590, 1750.00, '2026-03-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-03-door-1-rent', 3, '[]'),
(591, 1500.00, '2026-03-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-03-door-2-rent', 3, '[]'),
(592, 1319.00, '2026-03-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-03-door-3-rent', 3, '[]'),
(593, 1100.00, '2026-03-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-03-door-4-rent', 3, '[]'),
(594, 5817.00, '2026-04-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-04-rent', 3, '[]'),
(595, 1760.00, '2026-04-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-04-door-1-rent', 3, '[]'),
(596, 1722.00, '2026-04-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-04-door-2-rent', 3, '[]'),
(597, 1319.00, '2026-04-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-04-door-3-rent', 3, '[]'),
(598, 1016.00, '2026-04-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-04-door-4-rent', 3, '[]'),
(599, 5796.20, '2026-05-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-05-rent', 3, '[]'),
(600, 1800.00, '2026-05-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-05-door-1-rent', 3, '[]'),
(601, 1627.20, '2026-05-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-05-door-2-rent', 3, '[]'),
(602, 1319.00, '2026-05-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-05-door-3-rent', 3, '[]'),
(603, 1050.00, '2026-05-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-05-door-4-rent', 3, '[]'),
(604, 5836.00, '2026-06-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-06-rent', 3, '[]'),
(605, 1760.00, '2026-06-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-06-door-1-rent', 3, '[]'),
(606, 1707.00, '2026-06-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-06-door-2-rent', 3, '[]'),
(607, 1319.00, '2026-06-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-06-door-3-rent', 3, '[]'),
(608, 1050.00, '2026-06-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-06-door-4-rent', 3, '[]'),
(609, 4870.51, '2026-07-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-07-rent', 3, '[]'),
(610, 1800.00, '2026-07-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-07-door-1-rent', 3, '[]'),
(611, 701.51, '2026-07-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-07-door-2-rent', 3, '[]'),
(612, 1319.00, '2026-07-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-07-door-3-rent', 3, '[]'),
(613, 1050.00, '2026-07-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-07-door-4-rent', 3, '[]'),
(614, 4511.80, '2026-08-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-08-rent', 3, '[]'),
(615, 1750.00, '2026-08-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-08-door-1-rent', 3, '[]'),
(616, 392.80, '2026-08-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-08-door-2-rent', 3, '[]'),
(617, 1319.00, '2026-08-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-08-door-3-rent', 3, '[]'),
(618, 1050.00, '2026-08-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-08-door-4-rent', 3, '[]'),
(619, 5394.89, '2026-09-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-09-rent', 3, '[]'),
(620, 1800.00, '2026-09-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-09-door-1-rent', 3, '[]'),
(621, 1225.89, '2026-09-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-09-door-2-rent', 3, '[]'),
(622, 1319.00, '2026-09-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-09-door-3-rent', 3, '[]'),
(623, 1050.00, '2026-09-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-09-door-4-rent', 3, '[]'),
(624, 4767.35, '2026-10-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-10-rent', 3, '[]'),
(625, 1800.00, '2026-10-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-10-door-1-rent', 3, '[]'),
(626, 567.35, '2026-10-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-10-door-2-rent', 3, '[]'),
(627, 1350.00, '2026-10-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-10-door-3-rent', 3, '[]'),
(628, 1050.00, '2026-10-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-10-door-4-rent', 3, '[]'),
(629, 5338.11, '2026-11-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-11-rent', 3, '[]'),
(630, 1750.00, '2026-11-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-11-door-1-rent', 3, '[]'),
(631, 1138.11, '2026-11-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-11-door-2-rent', 3, '[]'),
(632, 1350.00, '2026-11-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-11-door-3-rent', 3, '[]'),
(633, 1100.00, '2026-11-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-11-door-4-rent', 3, '[]'),
(634, 4200.00, '2026-12-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-12-rent', 3, '[]'),
(635, 1750.00, '2026-12-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-12-door-1-rent', 3, '[]'),
(636, 1500.00, '2026-12-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-12-door-2-rent', 3, '[]'),
(637, 1350.00, '2026-12-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-12-door-3-rent', 3, '[]'),
(638, 1100.00, '2026-12-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-17-2026-12-door-4-rent', 3, '[]'),
(639, 2300.00, '2026-01-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-01-rent', 8, '[]'),
(640, 2300.00, '2026-02-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-02-rent', 8, '[]'),
(641, 2300.00, '2026-03-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-03-rent', 8, '[]'),
(642, 2300.00, '2026-04-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-04-rent', 8, '[]'),
(643, -2300.00, '2026-05-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-05-rent', 8, '[]'),
(644, -2300.00, '2026-06-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-06-rent', 8, '[]'),
(645, -2300.00, '2026-07-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-07-rent', 8, '[]'),
(646, -2300.00, '2026-08-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-08-rent', 8, '[]'),
(647, -2300.00, '2026-09-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-09-rent', 8, '[]'),
(648, -2300.00, '2026-10-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-10-rent', 8, '[]'),
(649, -2300.00, '2026-11-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-22-2026-11-rent', 8, '[]'),
(650, 850.00, '2025-01-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-01-rent', 4, '[]'),
(651, 850.00, '2025-01-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-01-door-4-rent', 4, '[]'),
(652, 850.00, '2025-02-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-02-rent', 4, '[]'),
(653, 850.00, '2025-02-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-02-door-4-rent', 4, '[]'),
(654, 850.00, '2025-03-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-03-rent', 4, '[]'),
(655, 850.00, '2025-03-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-03-door-4-rent', 4, '[]'),
(656, 850.00, '2025-04-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-04-rent', 4, '[]'),
(657, 850.00, '2025-04-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-04-door-4-rent', 4, '[]'),
(658, 850.00, '2025-05-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-05-rent', 4, '[]'),
(659, 850.00, '2025-05-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-05-door-4-rent', 4, '[]'),
(660, 850.00, '2025-06-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-06-rent', 4, '[]'),
(661, 850.00, '2025-06-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-06-door-4-rent', 4, '[]'),
(662, 850.00, '2025-07-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-07-rent', 4, '[]'),
(663, 850.00, '2025-07-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-07-door-4-rent', 4, '[]'),
(664, 850.00, '2025-08-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-08-rent', 4, '[]'),
(665, 850.00, '2025-08-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-08-door-4-rent', 4, '[]'),
(666, 850.00, '2025-09-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-09-rent', 4, '[]'),
(667, 850.00, '2025-09-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-09-door-4-rent', 4, '[]'),
(668, 850.00, '2025-10-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-10-rent', 4, '[]'),
(669, 850.00, '2025-10-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-10-door-4-rent', 4, '[]'),
(670, 850.00, '2025-11-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-11-rent', 4, '[]'),
(671, 850.00, '2025-11-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-11-door-4-rent', 4, '[]'),
(672, 850.00, '2025-12-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-12-rent', 4, '[]'),
(673, 850.00, '2025-12-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2025-18-2025-12-door-4-rent', 4, '[]'),
(674, 850.00, '2026-02-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-02-rent', 12, '[]'),
(675, 850.00, '2026-02-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-02-door-4-rent', 12, '[]'),
(676, 850.00, '2026-03-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-03-rent', 12, '[]'),
(677, 850.00, '2026-03-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-03-door-4-rent', 12, '[]'),
(678, 850.00, '2026-04-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-04-rent', 12, '[]'),
(679, 850.00, '2026-04-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-04-door-4-rent', 12, '[]'),
(680, 850.00, '2026-05-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-05-rent', 12, '[]'),
(681, 850.00, '2026-05-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-05-door-4-rent', 12, '[]'),
(682, 850.00, '2026-06-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-06-rent', 12, '[]'),
(683, 850.00, '2026-06-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-06-door-4-rent', 12, '[]'),
(684, 850.00, '2026-07-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-07-rent', 12, '[]'),
(685, 850.00, '2026-07-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-07-door-4-rent', 12, '[]'),
(686, 850.00, '2026-08-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-08-rent', 12, '[]'),
(687, 850.00, '2026-08-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-08-door-4-rent', 12, '[]'),
(688, 850.00, '2026-10-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-10-rent', 12, '[]'),
(689, 850.00, '2026-10-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-10-door-4-rent', 12, '[]'),
(690, 850.00, '2026-11-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-11-rent', 12, '[]'),
(691, 850.00, '2026-11-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-11-door-4-rent', 12, '[]'),
(692, 850.00, '2026-12-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-12-rent', 12, '[]'),
(693, 850.00, '2026-12-01', 'Paid', 'Rent', 'Excel Import', 'excel-import-2026-26-2026-12-door-4-rent', 12, '[]'),
(694, 1600.00, '2026-08-06', 'Paid', 'Rent', 'Cash', NULL, 1, '[]'),
(695, 1600.00, '2026-08-06', 'Paid', 'Rent', 'Cash', NULL, 1, '[]');

-- --------------------------------------------------------

--
-- Table structure for table `api_property`
--

CREATE TABLE `api_property` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(50) NOT NULL,
  `units` int(11) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  `image_url` varchar(200) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `bathrooms` decimal(3,1) NOT NULL,
  `bedrooms` int(11) NOT NULL,
  `square_footage` int(11) NOT NULL,
  `furnishing_type` varchar(50) DEFAULT NULL,
  `furnishings_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`furnishings_breakdown`)),
  `area` varchar(120) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'vacant',
  `short_stay_enabled` tinyint(1) NOT NULL,
  `short_stay_max_guests` int(10) UNSIGNED DEFAULT NULL CHECK (`short_stay_max_guests` >= 0),
  `short_stay_nightly_rate` decimal(10,2) DEFAULT NULL,
  `short_stay_check_in_time` varchar(20) DEFAULT NULL,
  `short_stay_check_out_time` varchar(20) DEFAULT NULL,
  `short_stay_cleaning_fee` decimal(10,2) NOT NULL,
  `short_stay_listing_area` varchar(120) NOT NULL,
  `short_stay_listing_description` longtext NOT NULL,
  `short_stay_listing_title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_property`
--

INSERT INTO `api_property` (`id`, `name`, `address`, `city`, `state`, `units`, `created_at`, `updated_at`, `image`, `image_url`, `price`, `bathrooms`, `bedrooms`, `square_footage`, `furnishing_type`, `furnishings_breakdown`, `area`, `status`, `short_stay_enabled`, `short_stay_max_guests`, `short_stay_nightly_rate`, `short_stay_check_in_time`, `short_stay_check_out_time`, `short_stay_cleaning_fee`, `short_stay_listing_area`, `short_stay_listing_description`, `short_stay_listing_title`) VALUES
(1, 'Unit A', '6835 Avenue Q, Unit A', 'Houston', 'TX', 1, '2026-04-02 11:37:15.207000', '2026-08-05 14:11:13.430401', 'media/properties/GA_Avenue_Q-Unit_A_eq7msd', '', 1750.00, 2.0, 3, 1000, 'Semi-furnished', '[\"House\", \"On-site parking\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer connections\", \"Stainless steel appliances\"]', 'Avenue Q', 'occupied', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'East Houston', 'Unwind in this beautifully kept home with soft lighting, comfy seating, and a calm atmosphere. Ideal for weekend escapes, work trips, or a relaxing Houston getaway.', 'Cozy Urban Retreat · Sunlit & Peaceful'),
(2, 'Unit B (Eado Escape)', '6835 Avenue Q', 'Houston', 'TX', 1, '2026-04-02 11:39:24.048000', '2026-08-05 14:11:14.691403', 'media/properties/GA_unit_B_rq7oda', 'https://res.cloudinary.com/du97pcuvh/image/upload/v1/media/properties/GA_unit_B_rq7oda', 1500.00, 2.0, 3, 1000, 'Fully-furnished', '[\"2nd floor unit\", \"1 parking spot\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer in unit\", \"Stainless steel appliances\"]', 'Avenue Q', 'vacant', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'Southeast Houston', 'A stylish, fully equipped stay with thoughtful touches throughout. Enjoy a clean, private space perfect for couples, families, or solo travelers.', 'Modern Comfort Haven · Quiet Neighborhood'),
(3, 'Unit 1', '6707 Sherman St. Unit 1', 'Houston', 'TX', 1, '2026-04-02 11:42:29.489000', '2026-08-05 14:14:50.921740', 'media/properties/Duplex_on_Sherman_srz6iq', 'https://res.cloudinary.com/du97pcuvh/image/upload/v1/media/properties/Duplex_on_Sherman_srz6iq', 1550.00, 2.0, 3, 1000, 'Semi-furnished', '[\"Property Type: Duplex\", \"On-site parking\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer connections\", \"Stainless steel appliances\"]', 'Sherman St', 'vacant', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'Inner Loop', 'Spread out and feel at home in this inviting space with room for everyone. Great for longer stays with easy access to dining, shopping, and local attractions.', 'Charming Family Getaway · Spacious & Warm'),
(4, 'Unit C', '6835 Avenue Q, Unit C', 'Houston', 'TX', 1, '2026-04-02 11:56:41.480000', '2026-08-05 14:11:16.012308', 'media/properties/6e6ab597306513047317a54e7692c226_pc7trq', 'https://res.cloudinary.com/du97pcuvh/image/upload/v1/media/properties/6e6ab597306513047317a54e7692c226_pc7trq', 1350.00, 1.0, 1, 1000, 'Fully-furnished', '[\"Downstairs unit\", \"1 parking spot\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer in unit\", \"Stainless steel appliances\"]', 'Avenue Q', 'occupied', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'North Houston', 'Step into a peaceful environment designed for rest and recharge. Comfortable beds, a welcoming layout, and a stress-free check-in experience.', 'Serene Hideaway · Relaxed Vibes'),
(5, 'Unit D (Eado Studio)', '6835 Avenue Q', 'Houston', 'TX', 1, '2026-04-02 11:58:34.527000', '2026-08-05 14:11:16.803902', 'media/properties/GA_Avenue_Q-_Unit_D_lwp1nb', 'https://res.cloudinary.com/du97pcuvh/image/upload/v1/media/properties/GA_Avenue_Q-_Unit_D_lwp1nb', 1100.00, 1.0, 1, 1000, 'Fully-furnished', '[\"Downstairs unit\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer in unit\", \"Stainless steel appliances\"]', 'Avenue Q', 'occupied', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'West Houston', 'Natural light fills this cheerful space with everything you need for a comfortable visit. Perfect for travelers who value cleanliness, comfort, and convenience.', 'Bright & Airy Stay · Home Away From Home'),
(6, 'Unit 2 (Urban Nesting)', '6707 Sherman St', 'Houston', 'TX', 1, '2026-04-02 12:01:05.941000', '2026-08-05 14:14:51.452429', 'media/properties/b0e73802cf067413a46c1516dbdf8ddc_jgsc1l', '', 850.00, 2.0, 3, 1000, 'Fully-furnished', '[\"Duplex\", \"On-site parking\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer in unit\", \"Stainless steel appliances\"]', 'Sherman St', 'vacant', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'Central Houston', 'Discover Houston from a well-located, thoughtfully furnished retreat. Ideal for guests who want a polished stay without the hotel feel.', 'Stylish City Escape · Walkable Area'),
(7, 'Unit 3', '6707 Sherman St, Unit 3', 'Houston', 'TX', 1, '2026-04-02 12:06:58.421000', '2026-08-05 14:14:51.950552', 'media/properties/GA_on_Sherman-_Unit_3_dmrxzb', '', 1050.00, 1.0, 1, 1000, 'Semi-furnished', '[\"Downstairs unit\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer in unit\", \"Stainless steel appliances\"]', 'Sherman St', 'vacant', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'South Houston', 'Enjoy a quiet setting with a cozy interior and all the essentials for a great stay. A wonderful choice for guests seeking comfort and privacy.', 'Tranquil Garden View Stay · Private & Calm'),
(8, 'Unit 4', '6707 Sherman St, Unit 4', 'Houston', 'TX', 1, '2026-04-02 12:08:08.008000', '2026-08-05 14:14:52.448251', 'media/properties/GA_on_Sherman-_Unit_4_ig99dy', '', 1650.00, 1.0, 1, 1000, 'Semi-furnished', '[\"Downstairs unit\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer in unit\", \"Stainless steel appliances\"]', 'Sherman St', 'vacant', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'Medical Center Area', 'Experience elevated comfort in this well-maintained home with quality furnishings and a refined feel. Suited for business travelers and leisure guests alike.', 'Elegant Short-Term Rental · Premium Comfort'),
(9, 'Unit 5', '6707 Sherman St', 'Houston', 'TX', 1, '2026-04-02 12:08:58.806000', '2026-08-05 14:14:52.923569', 'media/properties/GA_on_Sherman_-_Unit_5_ri4tx1', 'https://res.cloudinary.com/du97pcuvh/image/upload/v1/media/properties/GA_on_Sherman_-_Unit_5_ri4tx1', 1275.00, 2.0, 1, 1000, 'Semi-furnished', '[\"2nd floor unit\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer in unit\", \"Stainless steel appliances\"]', 'Sherman St', 'vacant', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'Greater Houston', 'A hassle-free stay in a clean, comfortable environment. Everything is set up so you can settle in quickly and enjoy your time in Houston.', 'Welcoming Guest Suite · Easy Check-In'),
(10, 'Unit 6', '6707 Sherman St, Unit 6', 'Houston', 'TX', 1, '2026-04-02 12:09:58.297000', '2026-08-05 14:14:53.436847', 'media/properties/GA_on_Sherman_-_Unit_6_swopsy', '', 1925.00, 1.0, 1, 1000, 'Semi-furnished', '[\"2nd floor unit\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer in unit\", \"Stainless steel appliances\"]', 'Sherman St', 'vacant', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'East End', 'Room to gather, relax, and make memories in this friendly, well-appointed space. Great for families, friends, and small group trips.', 'Sunny Retreat · Perfect for Groups'),
(11, 'Unit 1 (The Hideaway) 7425', '7425 Avenue H', 'Houston', 'TX', 1, '2026-04-02 12:11:23.737000', '2026-08-05 14:14:53.946006', 'media/properties/The_Hideaway_gddwfg', '', 1375.00, 1.0, 2, 1000, 'Fully-furnished', '[\"House\", \"On-site parking\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer in unit\", \"Stainless steel appliances\"]', 'Avenue H', 'vacant', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'Near Downtown', 'Snuggle into a warm, inviting atmosphere with soft linens and a laid-back charm. An excellent pick for a romantic weekend or peaceful solo retreat.', 'Nestled Comfort Cottage · Cozy Nights'),
(12, 'Unit 2 (Little H House) 7427', '7427 Avenue H', 'Houston', 'TX', 1, '2026-04-02 12:12:08.544000', '2026-08-05 14:11:23.382304', 'media/properties/Little_H_House_txhf3w', 'https://res.cloudinary.com/du97pcuvh/image/upload/v1/media/properties/Little_H_House_txhf3w', 850.00, 1.0, 2, 1000, 'Fully-furnished', '[\"House\", \"On-site parking\", \"Dishwasher\", \"Garbage disposal\", \"Washer and dryer connections\", \"Stainless steel appliances\"]', 'Avenue H', 'occupied', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'Midtown Houston', 'Simple, modern, and spotless — this stay is designed for guests who love a clutter-free space. Everything you need, nothing you do not.', 'Fresh & Clean Studio Feel · Minimal & Modern'),
(13, 'Unit 3 (Sweet Home) 7429', '7429 Avenue H', 'Houston', 'TX', 1, '2026-04-02 12:12:55.351000', '2026-08-05 14:14:54.440216', 'media/properties/Little_H_House_2_ehnawi', '', 975.00, 1.0, 2, 1000, 'Unfurnished', '[\"House\", \"On-site parking\"]', 'Avenue H', 'vacant', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'Third Ward', 'Leave the hustle behind in this restful home with comfortable living spaces and a welcoming vibe. Perfect when you just want to slow down and breathe.', 'Relaxing Weekend Spot · Unplug & Unwind'),
(14, 'Unit 4 - Erica', '7431 Avenue H', 'Houston', 'TX', 1, '2026-04-02 12:13:52.105000', '2026-08-05 14:14:54.920765', 'media/properties/Little_H_House_3_xbrmat', 'https://res.cloudinary.com/du97pcuvh/image/upload/v1/media/properties/Little_H_House_3_xbrmat', 1250.00, 1.0, 3, 1000, 'Unfurnished', '[\"House\", \"On-site parking\"]', 'Avenue H', 'vacant', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'Heights Area', 'Stay close to the action while enjoying a private, comfortable base. A smart choice for visitors exploring the city for the first time.', 'Houston Hideout · Central & Convenient'),
(15, 'Unit 1', '1403 70th Street, Unit 1', 'Houston', 'TX', 1, '2026-04-02 12:15:08.959000', '2026-08-05 14:12:36.097607', 'media/properties/70th_-_Unit_1_qb64hi', '', 1200.00, 1.0, 1, 1000, 'Semi-furnished', '[\"On-site parking\"]', '70th', 'occupied', 1, NULL, NULL, '3:00 PM', '11:00 AM', 75.00, 'Southwest Houston', 'A gentle, welcoming space for short visits and extended stays alike. Expect a clean home, responsive host support, and a smooth booking experience.', 'Peaceful Overnight Stay · Soft & Serene'),
(16, 'Conroe', '7304 Avenue F Street,', 'Houston', 'Texas', 1, '2026-06-18 13:19:32.168601', '2026-08-05 14:14:55.729457', '', NULL, 900.00, 2.0, 2, 1000, NULL, '[]', 'Conroe', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(17, 'Ave Q', '6835 Avenue Q', 'Houston', 'Texas', 4, '2026-06-18 13:20:15.278333', '2026-08-05 14:14:56.541211', '', NULL, 1275.00, 2.0, 2, 1000, NULL, '[]', 'Ave Q', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(18, 'Ave H', '7425,7427, 7429 and 7430 Avenue H', 'Houston', 'Texas', 4, '2026-06-18 13:20:58.522171', '2026-08-05 14:14:57.353432', '', NULL, 900.00, 2.0, 2, 1000, NULL, '[]', 'Ave H', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(19, 'Wooden', '903 Wooden Street,', 'Houston', 'Texas', 3, '2026-06-18 13:21:32.796158', '2026-08-05 14:14:58.140469', '', NULL, 1000.00, 2.0, 2, 1000, NULL, '[]', 'Wooden', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(20, 'Ave F', '7304 Avenue F Street,', 'Houston', 'Texas', 4, '2026-06-18 13:21:36.548587', '2026-08-05 14:14:58.944350', '', NULL, 1900.00, 2.0, 2, 1000, NULL, '[]', 'Ave F', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(22, 'Bella Jess', '21311 Bella Jess Drive', 'Houston', 'Texas', 1, '2026-06-18 13:29:41.991680', '2026-08-05 14:14:59.730869', '', NULL, 1650.00, 2.0, 2, 1000, NULL, '[]', 'Bella Jess', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(24, 'Tomball', '7304 Avenue F Street,', 'Houston', 'Texas', 1, '2026-06-18 13:30:45.279945', '2026-08-05 14:15:00.543602', '', NULL, 1500.00, 2.0, 2, 1000, NULL, '[]', 'Tomabll', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(25, 'Sherman', '6707 Sherman Street', 'Houston', 'Texas', 6, '2026-06-18 13:31:12.646271', '2026-08-05 14:15:01.379685', '', NULL, 1625.00, 2.0, 2, 1000, NULL, '[]', 'Sherman', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(26, '70th', '1403 70th Street,', 'Houston', 'Texas', 4, '2026-06-18 13:31:16.806258', '2026-08-05 14:15:02.219664', '', NULL, 875.00, 2.0, 2, 1000, NULL, '[]', '70th', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(27, 'Unit 2', '1403 70th Street,', 'Houston', 'Texas', 1, '2026-08-05 14:11:26.999854', '2026-08-05 14:15:03.022485', '', NULL, 1575.00, 2.0, 2, 1000, NULL, '[]', '70th', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(28, 'Unit 3', '1403 70th Street,', 'Houston', 'Texas', 1, '2026-08-05 14:11:27.449911', '2026-08-05 14:15:03.801736', '', NULL, 1400.00, 2.0, 2, 1000, NULL, '[]', '70th', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(29, 'Unit 4', '1403 70th Street,', 'Houston', 'Texas', 1, '2026-08-05 14:11:27.894362', '2026-08-05 14:15:04.595115', '', NULL, 1925.00, 2.0, 2, 1000, NULL, '[]', '70th', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(30, 'Unit 1', '903 Wooden Street,', 'Houston', 'Texas', 1, '2026-08-05 14:11:28.336499', '2026-08-05 14:15:05.393501', '', NULL, 1150.00, 2.0, 2, 1000, NULL, '[]', 'Wooden', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(31, 'Unit 2 (Cozy Suite)', '903 Wooden Street,', 'Houston', 'Texas', 1, '2026-08-05 14:11:28.777398', '2026-08-05 14:15:06.178073', '', NULL, 1575.00, 2.0, 2, 1000, NULL, '[]', 'Wooden', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(32, 'Unit 3', '903 Wooden Street,', 'Houston', 'Texas', 1, '2026-08-05 14:11:29.228520', '2026-08-05 14:15:06.943621', '', NULL, 1375.00, 2.0, 2, 1000, NULL, '[]', 'Wooden', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(33, 'Unit 1', '7304 Avenue F Street,', 'Houston', 'Texas', 1, '2026-08-05 14:11:29.659506', '2026-08-05 14:15:07.763222', '', NULL, 1400.00, 2.0, 2, 1000, NULL, '[]', 'Ave F', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(34, 'Unit 2', '7304 Avenue F Street,', 'Houston', 'Texas', 1, '2026-08-05 14:11:30.370008', '2026-08-05 14:15:08.539670', '', NULL, 1275.00, 2.0, 2, 1000, NULL, '[]', 'Ave F', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(35, 'Unit 3', '7304 Avenue F Street,', 'Houston', 'Texas', 1, '2026-08-05 14:11:30.810754', '2026-08-05 14:15:09.358831', '', NULL, 1825.00, 2.0, 2, 1000, NULL, '[]', 'Ave F', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', ''),
(36, 'Unit 4', '7304 Avenue F Street,', 'Houston', 'Texas', 1, '2026-08-05 14:11:31.272570', '2026-08-05 14:15:10.160451', '', NULL, 1025.00, 2.0, 2, 1000, NULL, '[]', 'Ave F', 'vacant', 1, NULL, NULL, NULL, NULL, 75.00, '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `api_propertyfinancials`
--

CREATE TABLE `api_propertyfinancials` (
  `id` bigint(20) NOT NULL,
  `purchase_price` decimal(12,2) DEFAULT NULL,
  `down_payment` decimal(12,2) DEFAULT NULL,
  `closing_cost` decimal(12,2) DEFAULT NULL,
  `loan_amount` decimal(12,2) DEFAULT NULL,
  `interest_rate` decimal(6,4) DEFAULT NULL,
  `loan_term_years` int(10) UNSIGNED DEFAULT NULL CHECK (`loan_term_years` >= 0),
  `monthly_mortgage_payment` decimal(12,2) DEFAULT NULL,
  `land_value` decimal(12,2) DEFAULT NULL,
  `annual_depreciation_years` decimal(5,1) NOT NULL,
  `escrow_notes` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `property_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_propertyfinancials`
--

INSERT INTO `api_propertyfinancials` (`id`, `purchase_price`, `down_payment`, `closing_cost`, `loan_amount`, `interest_rate`, `loan_term_years`, `monthly_mortgage_payment`, `land_value`, `annual_depreciation_years`, `escrow_notes`, `updated_at`, `property_id`) VALUES
(1, 0.00, 0.00, 0.00, 200000.00, 0.0000, 0, 0.00, 49500.00, 27.5, '', '2026-08-05 13:24:05.406465', 16),
(2, 555000.00, 145522.37, 25693.33, 416250.00, 0.0738, 30, 3685.79, 85000.00, 27.5, '', '2026-08-05 13:22:09.200503', 17),
(3, 300000.00, 41513.32, 0.00, 275580.06, 0.0900, 30, 2025.00, NULL, 27.5, 'Seller Finance Via David Hesham. 5 Year Maturity (July 10, 2030)', '2026-08-05 13:24:35.411955', 18),
(5, 180000.00, 18000.00, 0.00, 162000.00, 0.0800, 30, 1189.00, NULL, 27.5, 'Seller Finance Via David Hesham', '2026-08-05 13:25:12.505138', 20),
(7, 255000.00, 52234.95, 16897.62, 204000.00, 0.0725, 30, 2076.13, 49500.00, 27.5, '', '2026-08-05 13:22:40.924751', 22),
(8, 180000.00, 18000.00, NULL, 162000.00, 0.0800, 30, 1189.00, 49500.00, 27.5, 'Seller Finance Via David Hesham', '2026-08-05 13:23:32.072859', 24),
(9, 205000.00, 205000.00, 5257.00, 0.00, 0.0000, 0, 0.00, 100470.00, 27.5, '', '2026-08-05 13:23:12.675009', 25),
(10, 274000.00, 30000.00, 0.00, 274000.00, 0.0900, 30, 2192.00, NULL, 27.5, 'Seller Finance Via David Hesham', '2026-08-05 13:25:35.403687', 26),
(11, 555000.00, 145522.37, 25693.33, 416250.00, 0.0738, 30, 3685.79, 85000.00, 27.5, '', '2026-08-05 13:15:16.883500', 4),
(12, 300000.00, 41513.32, NULL, 275580.06, 0.0900, 30, 2025.00, NULL, 27.5, 'Seller Finance Via David Hesham. 5 Year Maturity (July 10, 2030)', '2026-08-05 13:19:21.073478', 11),
(13, 216507.00, 16507.00, NULL, 200000.00, 0.0900, 30, 1610.00, NULL, 27.5, 'Seller Finance Via David Hesham', '2026-08-05 13:25:22.916691', 19),
(14, 274000.00, 30000.00, NULL, 274000.00, 0.0900, 30, 2192.00, NULL, 27.5, 'Seller Finance Via David Hesham', '2026-08-05 13:20:22.926663', 15);

-- --------------------------------------------------------

--
-- Table structure for table `api_propertymanagerprofile`
--

CREATE TABLE `api_propertymanagerprofile` (
  `id` bigint(20) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_propertymanagerprofile`
--

INSERT INTO `api_propertymanagerprofile` (`id`, `phone`, `created_at`, `user_id`) VALUES
(1, '(713) 555-0199', '2026-06-16 17:42:09.933037', 4);

-- --------------------------------------------------------

--
-- Table structure for table `api_propertymanagerprofile_properties`
--

CREATE TABLE `api_propertymanagerprofile_properties` (
  `id` bigint(20) NOT NULL,
  `propertymanagerprofile_id` bigint(20) NOT NULL,
  `property_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_propertymanagerprofile_properties`
--

INSERT INTO `api_propertymanagerprofile_properties` (`id`, `propertymanagerprofile_id`, `property_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5),
(6, 1, 6),
(7, 1, 7),
(8, 1, 8),
(9, 1, 9),
(10, 1, 10),
(11, 1, 11),
(12, 1, 12),
(13, 1, 13),
(14, 1, 14),
(15, 1, 15),
(16, 1, 16),
(17, 1, 17),
(18, 1, 18),
(19, 1, 19),
(20, 1, 20),
(21, 1, 22),
(22, 1, 24),
(23, 1, 25),
(24, 1, 26);

-- --------------------------------------------------------

--
-- Table structure for table `api_propertymonthinput`
--

CREATE TABLE `api_propertymonthinput` (
  `id` bigint(20) NOT NULL,
  `unit_label` varchar(64) NOT NULL,
  `year` int(10) UNSIGNED NOT NULL CHECK (`year` >= 0),
  `month` smallint(5) UNSIGNED NOT NULL CHECK (`month` >= 0),
  `income_lines` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`income_lines`)),
  `opex_lines` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`opex_lines`)),
  `updated_at` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `property_id` bigint(20) NOT NULL,
  `unit_id` bigint(20) DEFAULT NULL,
  `updated_by_id` bigint(20) DEFAULT NULL,
  `financing_lines` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`financing_lines`)),
  `computed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`computed`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `api_propertyunit`
--

CREATE TABLE `api_propertyunit` (
  `id` bigint(20) NOT NULL,
  `label` varchar(100) NOT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL CHECK (`sort_order` >= 0),
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `property_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_propertyunit`
--

INSERT INTO `api_propertyunit` (`id`, `label`, `monthly_rent`, `status`, `sort_order`, `created_at`, `updated_at`, `property_id`) VALUES
(1, 'Unit A', 1750.00, 'occupied', 0, '2026-06-26 13:59:40.923538', '2026-06-26 13:59:40.923575', 17),
(2, 'Unit B (Eado Escape)', 1500.00, 'vacant', 1, '2026-06-26 13:59:47.205468', '2026-06-26 13:59:47.205482', 17),
(3, 'Unit C', 1350.00, 'occupied', 2, '2026-06-26 13:59:49.733642', '2026-06-26 13:59:49.733667', 17),
(4, 'Unit D (Eado Studio)', 1100.00, 'occupied', 3, '2026-06-26 13:59:50.001617', '2026-06-26 13:59:50.001640', 17),
(147, 'Unit 1', 1200.00, 'occupied', 0, '2026-08-04 18:34:32.131240', '2026-08-04 18:34:32.131273', 26),
(150, 'Unit 1', 0.00, 'vacant', 0, '2026-08-05 13:17:28.924363', '2026-08-05 13:17:28.924373', 25),
(151, 'Unit 2 (Urban Nesting)', 0.00, 'vacant', 1, '2026-08-05 13:17:29.182144', '2026-08-05 13:17:29.182184', 25),
(152, 'Unit 3', 0.00, 'vacant', 2, '2026-08-05 13:17:29.434165', '2026-08-05 13:17:29.434176', 25),
(153, 'Unit 4', 0.00, 'vacant', 3, '2026-08-05 13:17:29.694197', '2026-08-05 13:17:29.694215', 25),
(154, 'Unit 5', 0.00, 'vacant', 4, '2026-08-05 13:17:29.940729', '2026-08-05 13:17:29.940749', 25),
(155, 'Unit 6', 0.00, 'vacant', 5, '2026-08-05 13:17:30.190115', '2026-08-05 13:17:30.190148', 25),
(164, 'Unit 1', 1150.00, 'vacant', 0, '2026-08-05 13:20:10.277700', '2026-08-05 13:20:10.277721', 19),
(165, 'Unit 2 (Cozy Suite)', 1575.00, 'vacant', 1, '2026-08-05 13:20:10.525438', '2026-08-05 13:20:10.525453', 19),
(166, 'Unit 3', 1375.00, 'vacant', 2, '2026-08-05 13:20:10.772788', '2026-08-05 13:20:10.772811', 19),
(171, 'Unit 1 (The Hideaway) 7425', 0.00, 'vacant', 0, '2026-08-05 13:24:36.413561', '2026-08-05 13:24:36.413609', 18),
(172, 'Unit 2 (Little H House) 7427', 0.00, 'vacant', 1, '2026-08-05 13:24:36.674315', '2026-08-05 13:24:36.674324', 18),
(173, 'Unit 3 (Sweet Home) 7429', 0.00, 'vacant', 2, '2026-08-05 13:24:36.925561', '2026-08-05 13:24:36.925570', 18),
(174, 'Unit 4 - Erica', 0.00, 'vacant', 3, '2026-08-05 13:24:37.177063', '2026-08-05 13:24:37.177076', 18),
(175, 'Unit 1', 1400.00, 'vacant', 0, '2026-08-05 13:25:13.511790', '2026-08-05 13:25:13.511798', 20),
(176, 'Unit 2', 1275.00, 'vacant', 1, '2026-08-05 13:25:13.775664', '2026-08-05 13:25:13.775684', 20),
(177, 'Unit 3', 1825.00, 'vacant', 2, '2026-08-05 13:25:14.026799', '2026-08-05 13:25:14.026815', 20),
(178, 'Unit 4', 1025.00, 'vacant', 3, '2026-08-05 13:25:14.280067', '2026-08-05 13:25:14.280087', 20),
(179, 'Unit 2', 0.00, 'vacant', 1, '2026-08-05 13:25:36.427187', '2026-08-05 13:25:36.427198', 26),
(180, 'Unit 3', 0.00, 'vacant', 2, '2026-08-05 13:25:36.681535', '2026-08-05 13:25:36.681557', 26),
(181, 'Unit 4', 0.00, 'vacant', 3, '2026-08-05 13:25:36.929514', '2026-08-05 13:25:36.929522', 26),
(182, 'Unit 1 (The Hideaway) 7425', 1375.00, 'vacant', 0, '2026-08-06 21:38:22.320995', '2026-08-06 21:38:22.321181', 11),
(183, 'Unit 2 (Little H House) 7427', 850.00, 'occupied', 1, '2026-08-06 21:38:22.596098', '2026-08-06 21:38:22.596128', 11),
(184, 'Unit 3 (Sweet Home) 7429', 975.00, 'vacant', 2, '2026-08-06 21:38:22.934687', '2026-08-06 21:38:22.934715', 11),
(185, 'Unit 4 - Erica', 1250.00, 'vacant', 3, '2026-08-06 21:38:23.183289', '2026-08-06 21:38:23.183330', 11),
(186, 'Unit 1 (The Hideaway) 7425', 1375.00, 'vacant', 0, '2026-08-06 21:38:24.073467', '2026-08-06 21:38:24.073510', 13),
(187, 'Unit 2 (Little H House) 7427', 850.00, 'occupied', 1, '2026-08-06 21:38:24.354106', '2026-08-06 21:38:24.354132', 13),
(188, 'Unit 3 (Sweet Home) 7429', 975.00, 'vacant', 2, '2026-08-06 21:38:24.611736', '2026-08-06 21:38:24.611774', 13),
(189, 'Unit 4 - Erica', 1250.00, 'vacant', 3, '2026-08-06 21:38:24.876242', '2026-08-06 21:38:24.876273', 13),
(190, 'Unit 1 (The Hideaway) 7425', 1375.00, 'vacant', 0, '2026-08-06 21:38:25.612866', '2026-08-06 21:38:25.612899', 14),
(191, 'Unit 2 (Little H House) 7427', 850.00, 'occupied', 1, '2026-08-06 21:38:25.904972', '2026-08-06 21:38:25.905009', 14),
(192, 'Unit 3 (Sweet Home) 7429', 975.00, 'vacant', 2, '2026-08-06 21:38:26.209677', '2026-08-06 21:38:26.209706', 14),
(193, 'Unit 4 - Erica', 1250.00, 'vacant', 3, '2026-08-06 21:38:26.455558', '2026-08-06 21:38:26.455589', 14),
(194, 'Unit A', 1750.00, 'occupied', 0, '2026-08-06 21:38:27.235621', '2026-08-06 21:38:27.235661', 4),
(195, 'Unit B (Eado Escape)', 1500.00, 'vacant', 1, '2026-08-06 21:38:27.542947', '2026-08-06 21:38:27.542973', 4),
(196, 'Unit C', 1350.00, 'occupied', 2, '2026-08-06 21:38:27.846264', '2026-08-06 21:38:27.846299', 4),
(197, 'Unit D (Eado Studio)', 1100.00, 'occupied', 3, '2026-08-06 21:38:28.092998', '2026-08-06 21:38:28.093029', 4),
(198, 'Unit 1', 1200.00, 'occupied', 0, '2026-08-06 21:38:28.872027', '2026-08-06 21:38:28.872063', 15),
(199, 'Unit 2', 1575.00, 'vacant', 1, '2026-08-06 21:38:29.178226', '2026-08-06 21:38:29.178260', 15),
(200, 'Unit 3', 1400.00, 'vacant', 2, '2026-08-06 21:38:29.488956', '2026-08-06 21:38:29.488986', 15),
(201, 'Unit 4', 1925.00, 'vacant', 3, '2026-08-06 21:38:29.796245', '2026-08-06 21:38:29.796285', 15),
(202, 'Unit A', 1750.00, 'occupied', 0, '2026-08-06 21:38:30.770501', '2026-08-06 21:38:30.770537', 1),
(203, 'Unit B (Eado Escape)', 1500.00, 'vacant', 1, '2026-08-06 21:38:31.030731', '2026-08-06 21:38:31.030757', 1),
(204, 'Unit C', 1350.00, 'occupied', 2, '2026-08-06 21:38:31.323658', '2026-08-06 21:38:31.323688', 1),
(205, 'Unit D (Eado Studio)', 1100.00, 'occupied', 3, '2026-08-06 21:38:31.565680', '2026-08-06 21:38:31.565785', 1),
(206, 'Unit A', 1750.00, 'occupied', 0, '2026-08-06 21:38:32.450661', '2026-08-06 21:38:32.450699', 2),
(207, 'Unit B (Eado Escape)', 1500.00, 'vacant', 1, '2026-08-06 21:38:32.691433', '2026-08-06 21:38:32.691463', 2),
(208, 'Unit C', 1350.00, 'occupied', 2, '2026-08-06 21:38:32.966391', '2026-08-06 21:38:32.966429', 2),
(209, 'Unit D (Eado Studio)', 1100.00, 'occupied', 3, '2026-08-06 21:38:33.213958', '2026-08-06 21:38:33.213987', 2),
(210, 'Unit A', 1750.00, 'occupied', 0, '2026-08-06 21:38:33.991003', '2026-08-06 21:38:33.991033', 5),
(211, 'Unit B (Eado Escape)', 1500.00, 'vacant', 1, '2026-08-06 21:38:34.260532', '2026-08-06 21:38:34.260569', 5),
(212, 'Unit C', 1350.00, 'occupied', 2, '2026-08-06 21:38:34.506574', '2026-08-06 21:38:34.506604', 5),
(213, 'Unit D (Eado Studio)', 1100.00, 'occupied', 3, '2026-08-06 21:38:34.756929', '2026-08-06 21:38:34.756956', 5),
(214, 'Unit 1 (The Hideaway) 7425', 1375.00, 'vacant', 0, '2026-08-06 21:38:35.630151', '2026-08-06 21:38:35.630183', 12),
(215, 'Unit 2 (Little H House) 7427', 850.00, 'occupied', 1, '2026-08-06 21:38:35.936578', '2026-08-06 21:38:35.936605', 12),
(216, 'Unit 3 (Sweet Home) 7429', 975.00, 'vacant', 2, '2026-08-06 21:38:36.243648', '2026-08-06 21:38:36.243688', 12),
(217, 'Unit 4 - Erica', 1250.00, 'vacant', 3, '2026-08-06 21:38:36.550833', '2026-08-06 21:38:36.550861', 12),
(218, 'Unit 1', 1550.00, 'vacant', 0, '2026-08-06 21:38:37.526837', '2026-08-06 21:38:37.526868', 9),
(219, 'Unit 2 (Urban Nesting)', 850.00, 'vacant', 1, '2026-08-06 21:38:37.775350', '2026-08-06 21:38:37.775378', 9),
(220, 'Unit 3', 1050.00, 'vacant', 2, '2026-08-06 21:38:38.086495', '2026-08-06 21:38:38.086526', 9),
(221, 'Unit 4', 1650.00, 'vacant', 3, '2026-08-06 21:38:38.393762', '2026-08-06 21:38:38.393799', 9),
(222, 'Unit 5', 1275.00, 'vacant', 4, '2026-08-06 21:38:38.700759', '2026-08-06 21:38:38.700787', 9),
(223, 'Unit 6', 1925.00, 'vacant', 5, '2026-08-06 21:38:39.008014', '2026-08-06 21:38:39.008045', 9),
(224, 'Unit 1', 1550.00, 'vacant', 0, '2026-08-06 21:38:39.758121', '2026-08-06 21:38:39.758152', 10),
(225, 'Unit 2 (Urban Nesting)', 850.00, 'vacant', 1, '2026-08-06 21:38:40.031906', '2026-08-06 21:38:40.031933', 10),
(226, 'Unit 3', 1050.00, 'vacant', 2, '2026-08-06 21:38:40.339053', '2026-08-06 21:38:40.339084', 10),
(227, 'Unit 4', 1650.00, 'vacant', 3, '2026-08-06 21:38:40.590102', '2026-08-06 21:38:40.590132', 10),
(228, 'Unit 5', 1275.00, 'vacant', 4, '2026-08-06 21:38:40.956199', '2026-08-06 21:38:40.956231', 10),
(229, 'Unit 6', 1925.00, 'vacant', 5, '2026-08-06 21:38:41.263985', '2026-08-06 21:38:41.264011', 10),
(230, 'Unit 1', 1200.00, 'occupied', 0, '2026-08-06 21:38:42.120893', '2026-08-06 21:38:42.120925', 27),
(231, 'Unit 2', 1575.00, 'vacant', 1, '2026-08-06 21:38:42.368772', '2026-08-06 21:38:42.368793', 27),
(232, 'Unit 3', 1400.00, 'vacant', 2, '2026-08-06 21:38:42.612091', '2026-08-06 21:38:42.612132', 27),
(233, 'Unit 4', 1925.00, 'vacant', 3, '2026-08-06 21:38:42.861698', '2026-08-06 21:38:42.861729', 27),
(234, 'Unit 1', 1400.00, 'vacant', 0, '2026-08-06 21:38:43.596745', '2026-08-06 21:38:43.596780', 34),
(235, 'Unit 2', 1275.00, 'vacant', 1, '2026-08-06 21:38:43.849216', '2026-08-06 21:38:43.849246', 34),
(236, 'Unit 3', 1825.00, 'vacant', 2, '2026-08-06 21:38:44.094412', '2026-08-06 21:38:44.094440', 34),
(237, 'Unit 4', 1025.00, 'vacant', 3, '2026-08-06 21:38:44.338793', '2026-08-06 21:38:44.338824', 34),
(238, 'Unit 1', 1550.00, 'vacant', 0, '2026-08-06 21:38:45.095126', '2026-08-06 21:38:45.095159', 3),
(239, 'Unit 2 (Urban Nesting)', 850.00, 'vacant', 1, '2026-08-06 21:38:45.337533', '2026-08-06 21:38:45.337575', 3),
(240, 'Unit 3', 1050.00, 'vacant', 2, '2026-08-06 21:38:45.649063', '2026-08-06 21:38:45.649101', 3),
(241, 'Unit 4', 1650.00, 'vacant', 3, '2026-08-06 21:38:45.889077', '2026-08-06 21:38:45.889105', 3),
(242, 'Unit 5', 1275.00, 'vacant', 4, '2026-08-06 21:38:46.145717', '2026-08-06 21:38:46.145754', 3),
(243, 'Unit 6', 1925.00, 'vacant', 5, '2026-08-06 21:38:46.395183', '2026-08-06 21:38:46.395211', 3),
(244, 'Unit 1', 1550.00, 'vacant', 0, '2026-08-06 21:38:47.358353', '2026-08-06 21:38:47.358409', 6),
(245, 'Unit 2 (Urban Nesting)', 850.00, 'vacant', 1, '2026-08-06 21:38:47.610195', '2026-08-06 21:38:47.610223', 6),
(246, 'Unit 3', 1050.00, 'vacant', 2, '2026-08-06 21:38:47.917166', '2026-08-06 21:38:47.917210', 6),
(247, 'Unit 4', 1650.00, 'vacant', 3, '2026-08-06 21:38:48.166113', '2026-08-06 21:38:48.166142', 6),
(248, 'Unit 5', 1275.00, 'vacant', 4, '2026-08-06 21:38:48.407511', '2026-08-06 21:38:48.407561', 6),
(249, 'Unit 6', 1925.00, 'vacant', 5, '2026-08-06 21:38:48.715790', '2026-08-06 21:38:48.715833', 6),
(250, 'Unit 1', 1550.00, 'vacant', 0, '2026-08-06 21:38:49.463252', '2026-08-06 21:38:49.463279', 7),
(251, 'Unit 2 (Urban Nesting)', 850.00, 'vacant', 1, '2026-08-06 21:38:49.836603', '2026-08-06 21:38:49.836633', 7),
(252, 'Unit 3', 1050.00, 'vacant', 2, '2026-08-06 21:38:50.137716', '2026-08-06 21:38:50.137848', 7),
(253, 'Unit 4', 1650.00, 'vacant', 3, '2026-08-06 21:38:50.436212', '2026-08-06 21:38:50.436239', 7),
(254, 'Unit 5', 1275.00, 'vacant', 4, '2026-08-06 21:38:50.674855', '2026-08-06 21:38:50.674882', 7),
(255, 'Unit 6', 1925.00, 'vacant', 5, '2026-08-06 21:38:50.989805', '2026-08-06 21:38:50.989848', 7),
(256, 'Unit 1', 1550.00, 'vacant', 0, '2026-08-06 21:38:51.853561', '2026-08-06 21:38:51.853618', 8),
(257, 'Unit 2 (Urban Nesting)', 850.00, 'vacant', 1, '2026-08-06 21:38:52.092748', '2026-08-06 21:38:52.092779', 8),
(258, 'Unit 3', 1050.00, 'vacant', 2, '2026-08-06 21:38:52.422731', '2026-08-06 21:38:52.422772', 8),
(259, 'Unit 4', 1650.00, 'vacant', 3, '2026-08-06 21:38:52.725223', '2026-08-06 21:38:52.725266', 8),
(260, 'Unit 5', 1275.00, 'vacant', 4, '2026-08-06 21:38:52.988640', '2026-08-06 21:38:52.988677', 8),
(261, 'Unit 6', 1925.00, 'vacant', 5, '2026-08-06 21:38:53.242211', '2026-08-06 21:38:53.242238', 8),
(262, 'Unit 1', 1200.00, 'occupied', 0, '2026-08-06 21:38:53.989038', '2026-08-06 21:38:53.989078', 28),
(263, 'Unit 2', 1575.00, 'vacant', 1, '2026-08-06 21:38:54.234596', '2026-08-06 21:38:54.234627', 28),
(264, 'Unit 3', 1400.00, 'vacant', 2, '2026-08-06 21:38:54.480923', '2026-08-06 21:38:54.480949', 28),
(265, 'Unit 4', 1925.00, 'vacant', 3, '2026-08-06 21:38:54.730940', '2026-08-06 21:38:54.730971', 28),
(266, 'Unit 1', 1400.00, 'vacant', 0, '2026-08-06 21:38:55.534990', '2026-08-06 21:38:55.535092', 35),
(267, 'Unit 2', 1275.00, 'vacant', 1, '2026-08-06 21:38:55.785675', '2026-08-06 21:38:55.785703', 35),
(268, 'Unit 3', 1825.00, 'vacant', 2, '2026-08-06 21:38:56.061869', '2026-08-06 21:38:56.061905', 35),
(269, 'Unit 4', 1025.00, 'vacant', 3, '2026-08-06 21:38:56.303767', '2026-08-06 21:38:56.303812', 35),
(270, 'Unit 1', 1200.00, 'occupied', 0, '2026-08-06 21:38:57.134901', '2026-08-06 21:38:57.134936', 29),
(271, 'Unit 2', 1575.00, 'vacant', 1, '2026-08-06 21:38:57.388862', '2026-08-06 21:38:57.388892', 29),
(272, 'Unit 3', 1400.00, 'vacant', 2, '2026-08-06 21:38:57.643935', '2026-08-06 21:38:57.643977', 29),
(273, 'Unit 4', 1925.00, 'vacant', 3, '2026-08-06 21:38:57.885128', '2026-08-06 21:38:57.885244', 29),
(274, 'Unit 1', 1150.00, 'vacant', 0, '2026-08-06 21:38:58.669785', '2026-08-06 21:38:58.669814', 30),
(275, 'Unit 2 (Cozy Suite)', 1575.00, 'vacant', 1, '2026-08-06 21:38:58.924657', '2026-08-06 21:38:58.924697', 30),
(276, 'Unit 3', 1375.00, 'vacant', 2, '2026-08-06 21:38:59.167351', '2026-08-06 21:38:59.167383', 30),
(277, 'Unit 1', 1150.00, 'vacant', 0, '2026-08-06 21:38:59.904979', '2026-08-06 21:38:59.905006', 31),
(278, 'Unit 2 (Cozy Suite)', 1575.00, 'vacant', 1, '2026-08-06 21:39:00.148618', '2026-08-06 21:39:00.148650', 31),
(279, 'Unit 3', 1375.00, 'vacant', 2, '2026-08-06 21:39:00.405367', '2026-08-06 21:39:00.405410', 31),
(280, 'Unit 1', 1150.00, 'vacant', 0, '2026-08-06 21:39:01.171192', '2026-08-06 21:39:01.171221', 32),
(281, 'Unit 2 (Cozy Suite)', 1575.00, 'vacant', 1, '2026-08-06 21:39:01.415606', '2026-08-06 21:39:01.415637', 32),
(282, 'Unit 3', 1375.00, 'vacant', 2, '2026-08-06 21:39:01.690104', '2026-08-06 21:39:01.690148', 32),
(283, 'Unit 1', 1400.00, 'vacant', 0, '2026-08-06 21:39:02.427301', '2026-08-06 21:39:02.427329', 33),
(284, 'Unit 2', 1275.00, 'vacant', 1, '2026-08-06 21:39:02.676822', '2026-08-06 21:39:02.676851', 33),
(285, 'Unit 3', 1825.00, 'vacant', 2, '2026-08-06 21:39:02.969431', '2026-08-06 21:39:02.969460', 33),
(286, 'Unit 4', 1025.00, 'vacant', 3, '2026-08-06 21:39:03.223949', '2026-08-06 21:39:03.223985', 33),
(287, 'Unit 1', 1400.00, 'vacant', 0, '2026-08-06 21:39:03.985892', '2026-08-06 21:39:03.985920', 36),
(288, 'Unit 2', 1275.00, 'vacant', 1, '2026-08-06 21:39:04.227950', '2026-08-06 21:39:04.227987', 36),
(289, 'Unit 3', 1825.00, 'vacant', 2, '2026-08-06 21:39:04.468607', '2026-08-06 21:39:04.468643', 36),
(290, 'Unit 4', 1025.00, 'vacant', 3, '2026-08-06 21:39:04.716765', '2026-08-06 21:39:04.716795', 36);

-- --------------------------------------------------------

--
-- Table structure for table `api_shortstayblockeddate`
--

CREATE TABLE `api_shortstayblockeddate` (
  `id` bigint(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `property_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `api_shortstaybooking`
--

CREATE TABLE `api_shortstaybooking` (
  `id` bigint(20) NOT NULL,
  `guest_name` varchar(255) NOT NULL,
  `guest_email` varchar(254) NOT NULL,
  `guest_phone` varchar(50) NOT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `num_guests` int(10) UNSIGNED NOT NULL CHECK (`num_guests` >= 0),
  `nights` int(10) UNSIGNED NOT NULL CHECK (`nights` >= 0),
  `nightly_rate` decimal(10,2) NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `proof_of_payment_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`proof_of_payment_files`)),
  `notes` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `property_id` bigint(20) NOT NULL,
  `cleaning_fee` decimal(10,2) NOT NULL,
  `guest_id_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`guest_id_files`)),
  `access_pin` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_shortstaybooking`
--

INSERT INTO `api_shortstaybooking` (`id`, `guest_name`, `guest_email`, `guest_phone`, `check_in`, `check_out`, `num_guests`, `nights`, `nightly_rate`, `discount_percent`, `total_amount`, `payment_method`, `status`, `proof_of_payment_files`, `notes`, `created_at`, `updated_at`, `property_id`, `cleaning_fee`, `guest_id_files`, `access_pin`) VALUES
(1, 'Jay', 'sycajessie@gmail.com', '+1 555 8525', '2026-06-08', '2026-06-10', 1, 2, 115.00, 0.00, 295.00, 'Zelle', 'confirmed', '[{\"path\": \"media/short_stays/booking_1/proof_20260608_184213_9f56651a92246e429e55af38a432c57f_b6t0nv\", \"size\": 118110, \"filename\": \"9f56651a92246e429e55af38a432c57f.jpg\", \"uploaded_at\": \"2026-06-08T18:42:16.733724\"}]', '', '2026-06-08 18:42:13.125690', '2026-06-08 18:47:01.071451', 5, 65.00, '[{\"path\": \"media/short_stays/booking_1/guest_id_20260608_184216_ComingSoon_bhfjr8\", \"size\": 1799344, \"filename\": \"ComingSoon.png\", \"uploaded_at\": \"2026-06-08T18:42:19.616951\"}]', '3546'),
(2, 'Judy Anna', 'sycajessie@gmail.com', '+15552321', '2026-06-09', '2026-06-11', 1, 2, 115.00, 0.00, 295.00, 'Zelle', 'confirmed', '[{\"path\": \"media/short_stays/booking_2/proof_20260609_133034_2_cutyqt\", \"size\": 205019, \"filename\": \"2.jpg\", \"uploaded_at\": \"2026-06-09T13:30:38.681714\"}]', '', '2026-06-09 13:30:34.276499', '2026-06-09 13:31:41.346052', 4, 65.00, '[{\"path\": \"media/short_stays/booking_2/guest_id_20260609_133038_1_xxwkiz\", \"size\": 210660, \"filename\": \"1.jpg\", \"uploaded_at\": \"2026-06-09T13:30:39.804096\"}]', '6342');

-- --------------------------------------------------------

--
-- Table structure for table `api_tenant`
--

CREATE TABLE `api_tenant` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `property_unit` varchar(255) NOT NULL,
  `lease_start` date DEFAULT NULL,
  `lease_end` date DEFAULT NULL,
  `rent_amount` decimal(10,2) NOT NULL,
  `deposit` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `credit_score` int(11) DEFAULT NULL,
  `background_check_status` varchar(50) DEFAULT NULL,
  `application_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`application_data`)),
  `lease_status` varchar(50) DEFAULT NULL,
  `signed_lease_url` varchar(200) DEFAULT NULL,
  `income_verification_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`income_verification_files`)),
  `photo_id_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`photo_id_files`)),
  `background_check_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`background_check_files`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_tenant`
--

INSERT INTO `api_tenant` (`id`, `name`, `email`, `phone`, `status`, `property_unit`, `lease_start`, `lease_end`, `rent_amount`, `deposit`, `balance`, `credit_score`, `background_check_status`, `application_data`, `lease_status`, `signed_lease_url`, `income_verification_files`, `photo_id_files`, `background_check_files`) VALUES
(1, 'Freda Williams', 'proclaimnj@gmail.com', '123456789', 'Active', 'GA on Avenue Q - Unit D', NULL, NULL, 1600.00, 500.00, -3110.00, NULL, NULL, NULL, NULL, NULL, '[{\"path\": \"media/applications/tenant_1/income_20260402_125705_TestApp_uskz2d\", \"size\": 15484, \"filename\": \"TestApp.pdf\", \"uploaded_at\": \"2026-04-02T12:57:06.680484\"}]', '[{\"path\": \"media/applications/tenant_1/photo_id_20260402_125704_TestApp_xd3ryz\", \"size\": 15484, \"filename\": \"TestApp.pdf\", \"uploaded_at\": \"2026-04-02T12:57:05.973580\"}]', '[{\"path\": \"media/applications/tenant_1/background_20260402_125706_TestApp_l3swqv\", \"size\": 15484, \"filename\": \"TestApp.pdf\", \"uploaded_at\": \"2026-04-02T12:57:07.250563\"}]'),
(2, 'Rent Roll — Conroe', 'excel-import-16@neela.local', '0000000000', 'Active', '7304 Avenue F Street,', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(3, 'Rent Roll — Ave Q', 'excel-import-17@neela.local', '0000000000', 'Active', '6835 Avenue Q', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(4, 'Rent Roll — Ave H', 'excel-import-18@neela.local', '0000000000', 'Active', '7425,7427, 7429 and 7430 Avenue H', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(5, 'Rent Roll — Wooden', 'excel-import-19@neela.local', '0000000000', 'Active', '903 Wooden Street,', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(6, 'Rent Roll — Ave F', 'excel-import-20@neela.local', '0000000000', 'Active', '7304 Avenue F Street,', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(8, 'Rent Roll — Bella Jess', 'excel-import-22@neela.local', '0000000000', 'Active', '21311 Bella Jess Drive', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(10, 'Rent Roll — Tomabll', 'excel-import-24@neela.local', '0000000000', 'Active', '7304 Avenue F Street,', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(11, 'Rent Roll — Sherman', 'excel-import-25@neela.local', '0000000000', 'Active', '6707 Sherman Street', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(12, 'Rent Roll — 70th', 'excel-import-26@neela.local', '0000000000', 'Active', '1403 70th Street,', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(13, 'Ave Q — Door 1', 'excel-import-17-door1@neela.local', '0000000000', 'Active', 'Unit A', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(14, 'Ave Q — Door 2', 'excel-import-17-door2@neela.local', '0000000000', 'Active', 'Unit B', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(15, 'Ave Q — Door 3', 'excel-import-17-door3@neela.local', '0000000000', 'Active', 'Unit C', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(16, 'Ave Q — Door 4 (Eado Studio)', 'excel-import-17-door4@neela.local', '0000000000', 'Active', 'Unit D', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(17, 'Ave H — Little H House', 'excel-import-18-door4@neela.local', '0000000000', 'Active', 'Little H House', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(18, 'Rent Roll — Little H House', 'excel-import-12@neela.local', '0000000000', 'Active', '7427 Avenue H', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(19, 'Rent Roll — The Hideaway', 'excel-import-11@neela.local', '0000000000', 'Active', '7425 Avenue H', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(20, 'Rent Roll — GA on Avenue Q - Unit D', 'excel-import-5@neela.local', '0000000000', 'Active', '6835 Avenue Q', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(21, 'Rent Roll — GA on Avenue Q- Unit C', 'excel-import-4@neela.local', '0000000000', 'Active', '6835 Avenue Q, Unit C', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(22, 'Rent Roll — Little H House 2', 'excel-import-13@neela.local', '0000000000', 'Active', '7429 Avenue H', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(23, 'Rent Roll — 70th- Unit 1', 'excel-import-15@neela.local', '0000000000', 'Active', '1403 70th Street, Unit 1', NULL, NULL, 0.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, '[]', '[]', '[]'),
(24, 'Nii  Nunoo', 'niiahelenunoo@gmail.com', '5073045416', 'Active', 'Unit 1', NULL, NULL, 1550.00, 500.00, 1050.00, NULL, NULL, NULL, 'Sent', NULL, '[]', '[{\"filename\": \"133863783251213944.jpg\", \"path\": \"media/applications/tenant_24/photo_id_20260825_203308_133863783251213944_lzhi0q\", \"size\": 2164624, \"uploaded_at\": \"2026-08-25T20:33:10.211028\"}]', '[{\"filename\": \"133863783251213944.jpg\", \"path\": \"media/applications/tenant_24/background_20260825_203310_133863783251213944_m000ix\", \"size\": 2164624, \"uploaded_at\": \"2026-08-25T20:33:10.953070\"}]');

-- --------------------------------------------------------

--
-- Table structure for table `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add content type', 4, 'add_contenttype'),
(14, 'Can change content type', 4, 'change_contenttype'),
(15, 'Can delete content type', 4, 'delete_contenttype'),
(16, 'Can view content type', 4, 'view_contenttype'),
(17, 'Can add session', 5, 'add_session'),
(18, 'Can change session', 5, 'change_session'),
(19, 'Can delete session', 5, 'delete_session'),
(20, 'Can view session', 5, 'view_session'),
(21, 'Can add listing', 6, 'add_listing'),
(22, 'Can change listing', 6, 'change_listing'),
(23, 'Can delete listing', 6, 'delete_listing'),
(24, 'Can view listing', 6, 'view_listing'),
(25, 'Can add tenant', 7, 'add_tenant'),
(26, 'Can change tenant', 7, 'change_tenant'),
(27, 'Can delete tenant', 7, 'delete_tenant'),
(28, 'Can view tenant', 7, 'view_tenant'),
(29, 'Can add payment', 8, 'add_payment'),
(30, 'Can change payment', 8, 'change_payment'),
(31, 'Can delete payment', 8, 'delete_payment'),
(32, 'Can view payment', 8, 'view_payment'),
(33, 'Can add maintenance request', 9, 'add_maintenancerequest'),
(34, 'Can change maintenance request', 9, 'change_maintenancerequest'),
(35, 'Can delete maintenance request', 9, 'delete_maintenancerequest'),
(36, 'Can view maintenance request', 9, 'view_maintenancerequest'),
(37, 'Can add legal document', 10, 'add_legaldocument'),
(38, 'Can change legal document', 10, 'change_legaldocument'),
(39, 'Can delete legal document', 10, 'delete_legaldocument'),
(40, 'Can view legal document', 10, 'view_legaldocument'),
(41, 'Can add property', 11, 'add_property'),
(42, 'Can change property', 11, 'change_property'),
(43, 'Can delete property', 11, 'delete_property'),
(44, 'Can view property', 11, 'view_property'),
(45, 'Can add lease template', 12, 'add_leasetemplate'),
(46, 'Can change lease template', 12, 'change_leasetemplate'),
(47, 'Can delete lease template', 12, 'delete_leasetemplate'),
(48, 'Can view lease template', 12, 'view_leasetemplate'),
(49, 'Can add lease signing token', 13, 'add_leasesigningtoken'),
(50, 'Can change lease signing token', 13, 'change_leasesigningtoken'),
(51, 'Can delete lease signing token', 13, 'delete_leasesigningtoken'),
(52, 'Can view lease signing token', 13, 'view_leasesigningtoken'),
(53, 'Can add user', 14, 'add_user'),
(54, 'Can change user', 14, 'change_user'),
(55, 'Can delete user', 14, 'delete_user'),
(56, 'Can view user', 14, 'view_user'),
(57, 'Can add reset password', 15, 'add_resetpassword'),
(58, 'Can change reset password', 15, 'change_resetpassword'),
(59, 'Can delete reset password', 15, 'delete_resetpassword'),
(60, 'Can view reset password', 15, 'view_resetpassword'),
(61, 'Can add task result', 16, 'add_taskresult'),
(62, 'Can change task result', 16, 'change_taskresult'),
(63, 'Can delete task result', 16, 'delete_taskresult'),
(64, 'Can view task result', 16, 'view_taskresult'),
(65, 'Can add chord counter', 17, 'add_chordcounter'),
(66, 'Can change chord counter', 17, 'change_chordcounter'),
(67, 'Can delete chord counter', 17, 'delete_chordcounter'),
(68, 'Can view chord counter', 17, 'view_chordcounter'),
(69, 'Can add group result', 18, 'add_groupresult'),
(70, 'Can change group result', 18, 'change_groupresult'),
(71, 'Can delete group result', 18, 'delete_groupresult'),
(72, 'Can view group result', 18, 'view_groupresult'),
(73, 'Can add short stay booking', 19, 'add_shortstaybooking'),
(74, 'Can change short stay booking', 19, 'change_shortstaybooking'),
(75, 'Can delete short stay booking', 19, 'delete_shortstaybooking'),
(76, 'Can view short stay booking', 19, 'view_shortstaybooking'),
(77, 'Can add short stay blocked date', 20, 'add_shortstayblockeddate'),
(78, 'Can change short stay blocked date', 20, 'change_shortstayblockeddate'),
(79, 'Can delete short stay blocked date', 20, 'delete_shortstayblockeddate'),
(80, 'Can view short stay blocked date', 20, 'view_shortstayblockeddate'),
(81, 'Can add operating expense', 21, 'add_operatingexpense'),
(82, 'Can change operating expense', 21, 'change_operatingexpense'),
(83, 'Can delete operating expense', 21, 'delete_operatingexpense'),
(84, 'Can view operating expense', 21, 'view_operatingexpense'),
(85, 'Can add property financials', 22, 'add_propertyfinancials'),
(86, 'Can change property financials', 22, 'change_propertyfinancials'),
(87, 'Can delete property financials', 22, 'delete_propertyfinancials'),
(88, 'Can view property financials', 22, 'view_propertyfinancials'),
(89, 'Can add property manager profile', 23, 'add_propertymanagerprofile'),
(90, 'Can change property manager profile', 23, 'change_propertymanagerprofile'),
(91, 'Can delete property manager profile', 23, 'delete_propertymanagerprofile'),
(92, 'Can view property manager profile', 23, 'view_propertymanagerprofile'),
(93, 'Can add property unit', 24, 'add_propertyunit'),
(94, 'Can change property unit', 24, 'change_propertyunit'),
(95, 'Can delete property unit', 24, 'delete_propertyunit'),
(96, 'Can view property unit', 24, 'view_propertyunit'),
(97, 'Can add property month input', 25, 'add_propertymonthinput'),
(98, 'Can change property month input', 25, 'change_propertymonthinput'),
(99, 'Can delete property month input', 25, 'delete_propertymonthinput'),
(100, 'Can view property month input', 25, 'view_propertymonthinput'),
(101, 'Can add inquiry', 26, 'add_inquiry'),
(102, 'Can change inquiry', 26, 'change_inquiry'),
(103, 'Can delete inquiry', 26, 'delete_inquiry'),
(104, 'Can view inquiry', 26, 'view_inquiry');

-- --------------------------------------------------------

--
-- Table structure for table `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_celery_results_chordcounter`
--

CREATE TABLE `django_celery_results_chordcounter` (
  `id` int(11) NOT NULL,
  `group_id` varchar(255) NOT NULL,
  `sub_tasks` longtext NOT NULL,
  `count` int(10) UNSIGNED NOT NULL CHECK (`count` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_celery_results_groupresult`
--

CREATE TABLE `django_celery_results_groupresult` (
  `id` int(11) NOT NULL,
  `group_id` varchar(255) NOT NULL,
  `date_created` datetime(6) NOT NULL,
  `date_done` datetime(6) NOT NULL,
  `content_type` varchar(128) NOT NULL,
  `content_encoding` varchar(64) NOT NULL,
  `result` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_celery_results_taskresult`
--

CREATE TABLE `django_celery_results_taskresult` (
  `id` int(11) NOT NULL,
  `task_id` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL,
  `content_type` varchar(128) NOT NULL,
  `content_encoding` varchar(64) NOT NULL,
  `result` longtext DEFAULT NULL,
  `date_done` datetime(6) NOT NULL,
  `traceback` longtext DEFAULT NULL,
  `meta` longtext DEFAULT NULL,
  `task_args` longtext DEFAULT NULL,
  `task_kwargs` longtext DEFAULT NULL,
  `task_name` varchar(255) DEFAULT NULL,
  `worker` varchar(100) DEFAULT NULL,
  `date_created` datetime(6) NOT NULL,
  `periodic_task_name` varchar(255) DEFAULT NULL,
  `date_started` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(15, 'accounts', 'resetpassword'),
(14, 'accounts', 'user'),
(1, 'admin', 'logentry'),
(13, 'api', 'leasesigningtoken'),
(12, 'api', 'leasetemplate'),
(10, 'api', 'legaldocument'),
(6, 'api', 'listing'),
(26, 'api', 'inquiry'),
(9, 'api', 'maintenancerequest'),
(21, 'api', 'operatingexpense'),
(8, 'api', 'payment'),
(11, 'api', 'property'),
(22, 'api', 'propertyfinancials'),
(23, 'api', 'propertymanagerprofile'),
(25, 'api', 'propertymonthinput'),
(24, 'api', 'propertyunit'),
(20, 'api', 'shortstayblockeddate'),
(19, 'api', 'shortstaybooking'),
(7, 'api', 'tenant'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(4, 'contenttypes', 'contenttype'),
(17, 'django_celery_results', 'chordcounter'),
(18, 'django_celery_results', 'groupresult'),
(16, 'django_celery_results', 'taskresult'),
(5, 'sessions', 'session');

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2026-08-18 19:23:25.242932'),
(2, 'contenttypes', '0002_remove_content_type_name', '2026-08-18 19:23:25.846546'),
(3, 'auth', '0001_initial', '2026-08-18 19:23:27.055973'),
(4, 'auth', '0002_alter_permission_name_max_length', '2026-08-18 19:23:27.258474'),
(5, 'auth', '0003_alter_user_email_max_length', '2026-08-18 19:23:27.359719'),
(6, 'auth', '0004_alter_user_username_opts', '2026-08-18 19:23:27.463366'),
(7, 'auth', '0005_alter_user_last_login_null', '2026-08-18 19:23:27.564068'),
(8, 'auth', '0006_require_contenttypes_0002', '2026-08-18 19:23:27.661544'),
(9, 'auth', '0007_alter_validators_add_error_messages', '2026-08-18 19:23:27.763224'),
(10, 'auth', '0008_alter_user_username_max_length', '2026-08-18 19:23:27.864733'),
(11, 'auth', '0009_alter_user_last_name_max_length', '2026-08-18 19:23:27.966177'),
(12, 'auth', '0010_alter_group_name_max_length', '2026-08-18 19:23:28.167512'),
(13, 'auth', '0011_update_proxy_permissions', '2026-08-18 19:23:28.560643'),
(14, 'auth', '0012_alter_user_first_name_max_length', '2026-08-18 19:23:28.661553'),
(15, 'accounts', '0001_initial', '2026-08-18 19:23:30.381257'),
(16, 'accounts', '0002_user_role', '2026-08-18 19:23:30.683215'),
(17, 'admin', '0001_initial', '2026-08-18 19:23:31.289981'),
(18, 'admin', '0002_logentry_remove_auto_add', '2026-08-18 19:23:31.392742'),
(19, 'admin', '0003_logentry_add_action_flag_choices', '2026-08-18 19:23:31.495036'),
(20, 'api', '0001_initial', '2026-08-18 19:23:32.709420'),
(21, 'api', '0002_property', '2026-08-18 19:23:32.907818'),
(22, 'api', '0003_property_image', '2026-08-18 19:23:33.107806'),
(23, 'api', '0004_property_image_url_alter_property_image', '2026-08-18 19:23:33.411767'),
(24, 'api', '0005_property_price', '2026-08-18 19:23:33.611167'),
(25, 'api', '0006_leasetemplate_legaldocument_docusign_envelope_id_and_more', '2026-08-18 19:23:34.347504'),
(26, 'api', '0007_tenant_income_verification_files_and_more', '2026-08-18 19:23:34.863836'),
(27, 'api', '0008_tenant_background_check_files', '2026-08-18 19:23:35.167694'),
(28, 'api', '0009_alter_tenant_status', '2026-08-18 19:23:35.271108'),
(29, 'api', '0010_property_bathrooms_property_bedrooms_and_more', '2026-08-18 19:23:35.977306'),
(30, 'api', '0011_payment_proof_of_payment_files', '2026-08-18 19:23:36.277692'),
(31, 'api', '0012_property_furnishing_type_and_more', '2026-08-18 19:23:36.680635'),
(32, 'api', '0013_legaldocument_dropbox_sign', '2026-08-18 19:23:36.986280'),
(33, 'api', '0016_add_signing_audit', '2026-08-18 19:23:37.187592'),
(34, 'api', '0017_property_area_property_status', '2026-08-18 19:23:37.497160'),
(35, 'api', '0018_leasesigningtoken', '2026-08-18 19:23:37.810769'),
(36, 'api', '0019_alter_property_status', '2026-08-18 19:23:37.910105'),
(37, 'api', '0020_short_stay_booking', '2026-08-18 19:23:38.732825'),
(38, 'api', '0021_short_stay_enhancements', '2026-08-18 19:23:39.892669'),
(39, 'api', '0022_short_stay_blocked_date', '2026-08-18 19:23:40.296607'),
(40, 'api', '0023_short_stay_check_times_nullable', '2026-08-18 19:23:40.958215'),
(41, 'api', '0024_short_stay_access_pin', '2026-08-18 19:23:41.264160'),
(42, 'api', '0025_operating_expense', '2026-08-18 19:23:41.669306'),
(43, 'api', '0026_remove_legaldocument_dropbox_sign_signature_request_id_and_more', '2026-08-18 19:23:44.191443'),
(44, 'api', '0027_short_stay_listing_copy', '2026-08-18 19:23:44.927023'),
(45, 'api', '0028_property_month_input', '2026-08-18 19:23:45.863561'),
(46, 'api', '0029_propertymonthinput_financing_lines', '2026-08-18 19:23:46.184746'),
(47, 'api', '0030_propertymonthinput_computed', '2026-08-18 19:23:46.496293'),
(48, 'django_celery_results', '0001_initial', '2026-08-18 19:23:46.896533'),
(49, 'django_celery_results', '0002_add_task_name_args_kwargs', '2026-08-18 19:23:47.304252'),
(50, 'django_celery_results', '0003_auto_20181106_1101', '2026-08-18 19:23:47.403912'),
(51, 'django_celery_results', '0004_auto_20190516_0412', '2026-08-18 19:23:47.860099'),
(52, 'django_celery_results', '0005_taskresult_worker', '2026-08-18 19:23:48.267733'),
(53, 'django_celery_results', '0006_taskresult_date_created', '2026-08-18 19:23:49.243882'),
(54, 'django_celery_results', '0007_remove_taskresult_hidden', '2026-08-18 19:23:49.582371'),
(55, 'django_celery_results', '0008_chordcounter', '2026-08-18 19:23:49.784636'),
(56, 'django_celery_results', '0009_groupresult', '2026-08-18 19:23:58.859383'),
(57, 'django_celery_results', '0010_remove_duplicate_indices', '2026-08-18 19:23:59.255257'),
(58, 'django_celery_results', '0011_taskresult_periodic_task_name', '2026-08-18 19:23:59.459265'),
(59, 'django_celery_results', '0012_taskresult_date_started', '2026-08-18 19:23:59.660696'),
(60, 'django_celery_results', '0013_taskresult_django_cele_periodi_1993cf_idx', '2026-08-18 19:23:59.861621'),
(61, 'django_celery_results', '0014_alter_taskresult_status', '2026-08-18 19:23:59.962525'),
(62, 'sessions', '0001_initial', '2026-08-18 19:24:00.362615'),
(63, 'api', '0031_inquiry', '2026-08-28 13:30:00.000000');

-- --------------------------------------------------------

--
-- Table structure for table `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts_resetpassword`
--
ALTER TABLE `accounts_resetpassword`
  ADD PRIMARY KEY (`id`),
  ADD KEY `accounts_resetpassword_user_id_eb9ce7be_fk_accounts_user_id` (`user_id`);

--
-- Indexes for table `accounts_user`
--
ALTER TABLE `accounts_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `accounts_user_groups`
--
ALTER TABLE `accounts_user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `accounts_user_groups_user_id_group_id_59c0b32f_uniq` (`user_id`,`group_id`),
  ADD KEY `accounts_user_groups_group_id_bd11a704_fk_auth_group_id` (`group_id`);

--
-- Indexes for table `accounts_user_user_permissions`
--
ALTER TABLE `accounts_user_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `accounts_user_user_permi_user_id_permission_id_2ab516c2_uniq` (`user_id`,`permission_id`),
  ADD KEY `accounts_user_user_p_permission_id_113bb443_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `api_leasesigningtoken`
--
ALTER TABLE `api_leasesigningtoken`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD UNIQUE KEY `legal_document_id` (`legal_document_id`);

--
-- Indexes for table `api_leasetemplate`
--
ALTER TABLE `api_leasetemplate`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `api_legaldocument`
--
ALTER TABLE `api_legaldocument`
  ADD PRIMARY KEY (`id`),
  ADD KEY `api_legaldocument_tenant_id_cc08fd5a_fk_api_tenant_id` (`tenant_id`);

--
-- Indexes for table `api_listing`
--
ALTER TABLE `api_listing`
  ADD PRIMARY KEY (`id`);


--
-- Indexes for table `api_inquiry`
--
ALTER TABLE `api_inquiry`
  ADD PRIMARY KEY (`id`),
  ADD KEY `api_inquiry_status_created_at` (`status`, `created_at`),
  ADD KEY `api_inquiry_source` (`source`);

--
-- Indexes for table `api_maintenancerequest`
--
ALTER TABLE `api_maintenancerequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `api_maintenancerequest_tenant_id_aebc31f5_fk_api_tenant_id` (`tenant_id`);

--
-- Indexes for table `api_operatingexpense`
--
ALTER TABLE `api_operatingexpense`
  ADD PRIMARY KEY (`id`),
  ADD KEY `api_operatingexpense_property_id_90a26b0f_fk_api_property_id` (`property_id`),
  ADD KEY `api_operatingexpense_created_by_id_f29232b6_fk_accounts_user_id` (`created_by_id`),
  ADD KEY `api_operatingexpense_unit_id_c2bbb26d_fk_api_propertyunit_id` (`unit_id`);

--
-- Indexes for table `api_payment`
--
ALTER TABLE `api_payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `api_payment_tenant_id_0e95d667_fk_api_tenant_id` (`tenant_id`);

--
-- Indexes for table `api_property`
--
ALTER TABLE `api_property`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `api_propertyfinancials`
--
ALTER TABLE `api_propertyfinancials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `property_id` (`property_id`);

--
-- Indexes for table `api_propertymanagerprofile`
--
ALTER TABLE `api_propertymanagerprofile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `api_propertymanagerprofile_properties`
--
ALTER TABLE `api_propertymanagerprofile_properties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_propertymanagerprofi_propertymanagerprofile_i_fbaf2f2a_uniq` (`propertymanagerprofile_id`,`property_id`),
  ADD KEY `api_propertymanagerp_property_id_467d1dbd_fk_api_prope` (`property_id`);

--
-- Indexes for table `api_propertymonthinput`
--
ALTER TABLE `api_propertymonthinput`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_propertymonthinput_property_id_unit_label_y_5c572052_uniq` (`property_id`,`unit_label`,`year`,`month`),
  ADD KEY `api_propertymonthinput_unit_id_955ce762_fk_api_propertyunit_id` (`unit_id`),
  ADD KEY `api_propertymonthinp_updated_by_id_556f8090_fk_accounts_` (`updated_by_id`);

--
-- Indexes for table `api_propertyunit`
--
ALTER TABLE `api_propertyunit`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_propertyunit_property_id_label_c88cf55f_uniq` (`property_id`,`label`);

--
-- Indexes for table `api_shortstayblockeddate`
--
ALTER TABLE `api_shortstayblockeddate`
  ADD PRIMARY KEY (`id`),
  ADD KEY `api_shortstayblockeddate_property_id_9c5a72c1_fk_api_property_id` (`property_id`);

--
-- Indexes for table `api_shortstaybooking`
--
ALTER TABLE `api_shortstaybooking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `api_shortstaybooking_property_id_c3a0d06f_fk_api_property_id` (`property_id`);

--
-- Indexes for table `api_tenant`
--
ALTER TABLE `api_tenant`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indexes for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_accounts_user_id` (`user_id`);

--
-- Indexes for table `django_celery_results_chordcounter`
--
ALTER TABLE `django_celery_results_chordcounter`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `group_id` (`group_id`);

--
-- Indexes for table `django_celery_results_groupresult`
--
ALTER TABLE `django_celery_results_groupresult`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `group_id` (`group_id`),
  ADD KEY `django_cele_date_cr_bd6c1d_idx` (`date_created`),
  ADD KEY `django_cele_date_do_caae0e_idx` (`date_done`);

--
-- Indexes for table `django_celery_results_taskresult`
--
ALTER TABLE `django_celery_results_taskresult`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `task_id` (`task_id`),
  ADD KEY `django_cele_task_na_08aec9_idx` (`task_name`),
  ADD KEY `django_cele_status_9b6201_idx` (`status`),
  ADD KEY `django_cele_worker_d54dd8_idx` (`worker`),
  ADD KEY `django_cele_date_cr_f04a50_idx` (`date_created`),
  ADD KEY `django_cele_date_do_f59aad_idx` (`date_done`),
  ADD KEY `django_cele_periodi_1993cf_idx` (`periodic_task_name`);

--
-- Indexes for table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indexes for table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts_resetpassword`
--
ALTER TABLE `accounts_resetpassword`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `accounts_user`
--
ALTER TABLE `accounts_user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `accounts_user_groups`
--
ALTER TABLE `accounts_user_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `accounts_user_user_permissions`
--
ALTER TABLE `accounts_user_user_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `api_leasesigningtoken`
--
ALTER TABLE `api_leasesigningtoken`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `api_leasetemplate`
--
ALTER TABLE `api_leasetemplate`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `api_legaldocument`
--
ALTER TABLE `api_legaldocument`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `api_listing`
--
ALTER TABLE `api_listing`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `api_maintenancerequest`
--
ALTER TABLE `api_maintenancerequest`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `api_operatingexpense`
--
ALTER TABLE `api_operatingexpense`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6501;

--
-- AUTO_INCREMENT for table `api_payment`
--
ALTER TABLE `api_payment`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=696;

--
-- AUTO_INCREMENT for table `api_property`
--
ALTER TABLE `api_property`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `api_propertyfinancials`
--
ALTER TABLE `api_propertyfinancials`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `api_propertymanagerprofile`
--
ALTER TABLE `api_propertymanagerprofile`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `api_propertymanagerprofile_properties`
--
ALTER TABLE `api_propertymanagerprofile_properties`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `api_propertymonthinput`
--
ALTER TABLE `api_propertymonthinput`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `api_propertyunit`
--
ALTER TABLE `api_propertyunit`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=291;

--
-- AUTO_INCREMENT for table `api_shortstayblockeddate`
--
ALTER TABLE `api_shortstayblockeddate`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `api_shortstaybooking`
--
ALTER TABLE `api_shortstaybooking`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `api_tenant`
--
ALTER TABLE `api_tenant`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;


--
-- AUTO_INCREMENT for table `api_inquiry`
--
ALTER TABLE `api_inquiry`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_celery_results_chordcounter`
--
ALTER TABLE `django_celery_results_chordcounter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_celery_results_groupresult`
--
ALTER TABLE `django_celery_results_groupresult`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_celery_results_taskresult`
--
ALTER TABLE `django_celery_results_taskresult`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts_resetpassword`
--
ALTER TABLE `accounts_resetpassword`
  ADD CONSTRAINT `accounts_resetpassword_user_id_eb9ce7be_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`);

--
-- Constraints for table `accounts_user_groups`
--
ALTER TABLE `accounts_user_groups`
  ADD CONSTRAINT `accounts_user_groups_group_id_bd11a704_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `accounts_user_groups_user_id_52b62117_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`);

--
-- Constraints for table `accounts_user_user_permissions`
--
ALTER TABLE `accounts_user_user_permissions`
  ADD CONSTRAINT `accounts_user_user_p_permission_id_113bb443_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `accounts_user_user_p_user_id_e4f0a161_fk_accounts_` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`);

--
-- Constraints for table `api_leasesigningtoken`
--
ALTER TABLE `api_leasesigningtoken`
  ADD CONSTRAINT `api_leasesigningtoke_legal_document_id_e0e524ec_fk_api_legal` FOREIGN KEY (`legal_document_id`) REFERENCES `api_legaldocument` (`id`);

--
-- Constraints for table `api_legaldocument`
--
ALTER TABLE `api_legaldocument`
  ADD CONSTRAINT `api_legaldocument_tenant_id_cc08fd5a_fk_api_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `api_tenant` (`id`);

--
-- Constraints for table `api_maintenancerequest`
--
ALTER TABLE `api_maintenancerequest`
  ADD CONSTRAINT `api_maintenancerequest_tenant_id_aebc31f5_fk_api_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `api_tenant` (`id`);

--
-- Constraints for table `api_operatingexpense`
--
ALTER TABLE `api_operatingexpense`
  ADD CONSTRAINT `api_operatingexpense_created_by_id_f29232b6_fk_accounts_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `accounts_user` (`id`),
  ADD CONSTRAINT `api_operatingexpense_property_id_90a26b0f_fk_api_property_id` FOREIGN KEY (`property_id`) REFERENCES `api_property` (`id`),
  ADD CONSTRAINT `api_operatingexpense_unit_id_c2bbb26d_fk_api_propertyunit_id` FOREIGN KEY (`unit_id`) REFERENCES `api_propertyunit` (`id`);

--
-- Constraints for table `api_payment`
--
ALTER TABLE `api_payment`
  ADD CONSTRAINT `api_payment_tenant_id_0e95d667_fk_api_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `api_tenant` (`id`);

--
-- Constraints for table `api_propertyfinancials`
--
ALTER TABLE `api_propertyfinancials`
  ADD CONSTRAINT `api_propertyfinancials_property_id_4f7ac686_fk_api_property_id` FOREIGN KEY (`property_id`) REFERENCES `api_property` (`id`);

--
-- Constraints for table `api_propertymanagerprofile`
--
ALTER TABLE `api_propertymanagerprofile`
  ADD CONSTRAINT `api_propertymanagerprofile_user_id_a72f9171_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`);

--
-- Constraints for table `api_propertymanagerprofile_properties`
--
ALTER TABLE `api_propertymanagerprofile_properties`
  ADD CONSTRAINT `api_propertymanagerp_property_id_467d1dbd_fk_api_prope` FOREIGN KEY (`property_id`) REFERENCES `api_property` (`id`),
  ADD CONSTRAINT `api_propertymanagerp_propertymanagerprofi_f833dfa8_fk_api_prope` FOREIGN KEY (`propertymanagerprofile_id`) REFERENCES `api_propertymanagerprofile` (`id`);

--
-- Constraints for table `api_propertymonthinput`
--
ALTER TABLE `api_propertymonthinput`
  ADD CONSTRAINT `api_propertymonthinp_updated_by_id_556f8090_fk_accounts_` FOREIGN KEY (`updated_by_id`) REFERENCES `accounts_user` (`id`),
  ADD CONSTRAINT `api_propertymonthinput_property_id_0bb81eb7_fk_api_property_id` FOREIGN KEY (`property_id`) REFERENCES `api_property` (`id`),
  ADD CONSTRAINT `api_propertymonthinput_unit_id_955ce762_fk_api_propertyunit_id` FOREIGN KEY (`unit_id`) REFERENCES `api_propertyunit` (`id`);

--
-- Constraints for table `api_propertyunit`
--
ALTER TABLE `api_propertyunit`
  ADD CONSTRAINT `api_propertyunit_property_id_14827a58_fk_api_property_id` FOREIGN KEY (`property_id`) REFERENCES `api_property` (`id`);

--
-- Constraints for table `api_shortstayblockeddate`
--
ALTER TABLE `api_shortstayblockeddate`
  ADD CONSTRAINT `api_shortstayblockeddate_property_id_9c5a72c1_fk_api_property_id` FOREIGN KEY (`property_id`) REFERENCES `api_property` (`id`);

--
-- Constraints for table `api_shortstaybooking`
--
ALTER TABLE `api_shortstaybooking`
  ADD CONSTRAINT `api_shortstaybooking_property_id_c3a0d06f_fk_api_property_id` FOREIGN KEY (`property_id`) REFERENCES `api_property` (`id`);

--
-- Constraints for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Constraints for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Constraints for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
