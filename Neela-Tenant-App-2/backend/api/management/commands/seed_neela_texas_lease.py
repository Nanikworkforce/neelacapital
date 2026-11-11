"""
Seed the Neela Texas Residential Lease as the preferred active lease template.
"""
from django.core.management.base import BaseCommand
from api.models import LeaseTemplate

TEMPLATE_NAME = 'Neela Texas Residential Lease'

NEELA_TEXAS_LEASE = r"""TEXAS RESIDENTIAL LEASE AGREEMENT

1. THE PARTIES
This Residential Lease Agreement ("Agreement") made on {{current_date}} is between:
Landlord's Name: NEELA CAPITAL INVESTMENTS
Mailing Address: {{landlord_address}}
Tenant's Name: {{tenant_name}}
Tenant's Phone: {{tenant_phone}}
Tenant's Email: {{tenant_email}}
Occupants: {{occupants}}
Occupant's Phone: {{occupant_phone}}

1.1 LEASE TERM NOTE: The tenancy established under this agreement is strictly month-to-month. A 12-month fixed-term lease shall not take effect or be enforceable unless and until prior written approval for a 12-month lease is formally executed by the Landlord. Verbal representations or ongoing discussions alone do not establish a 12-month tenancy.

2. PROPERTY
Property Address: {{property_address}}
Residence Type: {{residence_type}}
Bedroom(s): {{bedrooms}}    Bathroom(s): {{bathrooms}}

3. FURNITURE
{{furnished_no}} The Property is not furnished.
{{furnished_yes}} The Property is furnished with the following: {{furnishings_list}}

4. APPLIANCES
Appliances Included: {{appliances_list}}

5. RENT
Monthly Rent: {{rent_amount}}
Due Date: 3rd of the month or otherwise agreed as {{rent_due_day}} of the month
Acceptable Payment Methods:
{{pay_ach}} ACH (electronic bank transfer)
{{pay_cash}} Cash
{{pay_check}} Check
{{pay_zelle}} Zelle: neelarealestatellc@gmail.com (Preferable)
{{pay_other}} Other: {{payment_other}}

6. TERM
{{term_month_to_month}} Month-to-month: This Agreement is a month-to-month lease with a start date of {{lease_start_date}} and terminates upon either the Landlord or Tenant providing written notice of at least {{notice_days}} days or the minimum statutory period required under Governing Law, whichever is greater.
{{term_standard}} Standard lease: This Agreement has a start date of {{lease_start_date}} and an end date of {{lease_end_date}}.

7. EARLY MOVE-IN
{{early_move_in_no}} The Tenant is not permitted to move into the Property before the Start Date.
{{early_move_in_yes}} The Tenant is permitted to move in on {{early_move_in_date}} (pro-rated rent due: {{early_move_in_prorated}}).

8. SECURITY DEPOSIT
{{deposit_none}} No security deposit is required as part of this Agreement.
{{deposit_required}} A security deposit of {{deposit_amount}} is required and is due at the execution of this Agreement.

9. PRE-PAYMENT OF RENT
{{prepaid_none}} The Tenant is not required to pre-pay rent other than the 1st month's rent amount, which is due at the signing of this Agreement.
{{prepaid_required}} The Tenant shall pre-pay rent of {{prepaid_rent_amount}} for the period {{prepaid_rent_period}}.

10. LATE RENT
If Rent is paid after the due date, which includes any statutory rent grace period, there shall be a penalty that is a fixed amount equal to {{late_fee_amount}}. The late fee is charged to the Tenant {{late_fee_one_time}} one time {{late_fee_daily}} for each day rent is late.

11. NSF FEE
If the Tenant pays rent with a check not honored by the Landlord's financial institution due to non-sufficient funds (NSF), a stop payment, or any other reason, the Tenant agrees to pay a penalty equal to {{nsf_fixed}} {{nsf_amount}} {{nsf_max_statutory}} the maximum allowable statutory amount for each occurrence.

12. UTILITIES & SERVICES
{{utilities_tenant}} The Landlord is not responsible for any utilities and services.
{{utilities_landlord}} The Landlord is responsible for the following utilities and services: {{utilities_list}}
Utilities and Services Included in the Rent:
{{util_water}} Water  {{util_electricity}} Electricity  {{util_gas}} Gas  {{util_internet}} Internet  {{util_other}} Other: {{utilities_other}}

13. PETS
{{pets_none}} No pets are allowed on the Property except for animals legally recognized as service animals under applicable laws or those designated as emotional support animals by a licensed medical professional. All service and emotional support animals must comply with any applicable regulations and must be registered with the Landlord prior to or during the Term.
{{pets_allowed}} Pets are allowed subject to the following: {{pet_terms}}  Pet Fee: {{pet_fee}}

14. MOVE-IN INSPECTION
{{inspection_none}} No move-in inspection is required to be completed as part of this Agreement. If a move-in inspection is conducted, it shall be recognized as valid if completed and signed by both the Landlord and Tenant.
{{inspection_required}} A move-in inspection is required and shall be completed by {{inspection_by}}.

15. SMOKING POLICY
{{smoking_no}} Smoking is not permitted anywhere on the Property. This includes, but is not limited to, the use of tobacco or marijuana products, whether through smoking, vaping, or any other traditional or non-traditional methods. The Landlord will strictly enforce any violation of this section.
{{smoking_yes}} Smoking is permitted only in the following areas: {{smoking_areas}}

16. RENTERS INSURANCE
{{insurance_optional}} The Tenant is not legally obligated to obtain or maintain renters insurance as part of this Agreement. However, the Tenant can obtain such insurance for their own benefit.
{{insurance_required}} The Tenant is required to obtain and maintain renters insurance as described in Section 22(r), with minimum liability coverage of {{insurance_min}}.

17. SUBLETTING
The Tenant shall not have the right to sublet the Property or any part thereof without the prior written consent of the Landlord. If consent is granted by the Landlord, the Tenant shall be responsible for all actions and liabilities of the subtenant, including but not limited to any damage to the Property, non-payment of rent, eviction procedures, and any other liability related to the Property. In the event of an eviction, the Tenant shall be responsible for all court filing fees, legal representation, and any other liabilities in connection with removing the subtenant. The express written consent from the Landlord for one sublet agreement shall not authorize consent for any subsequent sublet agreements, and in such case, the Tenant must seek consent from the Landlord for the subsequent sublet agreement.

18. NOTICES
If notice is sent by either Party, it shall be sent to:
Landlord
Landlord's Name: {{landlord_name}}
Mailing Address: {{landlord_address}}
Tenant
Tenant's Name: {{tenant_name}}
Mailing Address: {{property_address}}

19. AUTHORIZED PERSONS
Unless the Landlord gives written, electronic, or verbal communication to the Tenant, there are no other persons allowed on or in the Property.

20. LEAD-BASED PAINT DISCLOSURE
{{lead_pre_1978}} The Property was constructed prior to January 1, 1978. Therefore, the Landlord is required to give the Tenant a "Disclosure of Information on Lead-Based Paint and/or Lead-Based Paint Hazards" and the brochure "Protect Your Family From Lead in Your Home." With the Tenant's signature on this Agreement, they acknowledge receipt of both required disclosure forms, whether attached to this Agreement or given to them separately.
{{lead_post_1978}} The Property was constructed on or after January 1, 1978, and this disclosure does not apply.

21. DEFINITIONS
The terms mentioned in this Agreement are defined below:
a.) Abandonment. If the Tenant vacates or abandons the Property for a period of up to seven days without informing the Landlord, the Tenant will be considered in default of this Agreement. If the Landlord believes the Tenant has vacated and abandoned the Property, the Landlord is entitled to inspect the Property by providing 24 hours' notice or the timeframe required under Governing Law, whichever is greater.
b.) Access. Upon the start of the Proration Period or the Term, whichever is earlier, the Landlord agrees to provide entry to the Tenant in the form of keys, fobs, cards, or any type of keyless access to the Property and any shared Common Areas. Access to the Property shall be given after the successful payment and receipt of the amounts required at the execution of this Agreement.
c.) Additional Occupants. Also referred to simply as "Occupants," these are individuals who have a legal right to reside on the Property under the Tenant. The Tenant agrees to bear any and all responsibility and liability for any actions caused, directly or indirectly, by an Occupant.
d.) Disclosures. The Disclosures mentioned in this Agreement, whether or not they are attached, are accepted, acknowledged, and understood by the Tenant upon executing this Agreement.
e.) Early Move-In. If the Tenant is permitted an Early Move-In, and any pro-rated rent is required to be paid, such payment must be made by the Tenant at the execution of this Agreement. If applicable and selected in Section 7, this Early Move-In period shall be protected under the same rights as the Term of this Agreement.
f.) Furnishings and Appliances. The Tenant understands that the Furnishings and Appliances mentioned herein are under the Landlord's ownership and must be returned in the same condition as at the start of the Term.
g.) Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which the Property is located.
h.) Guests. Individuals who are not named as the Tenant or an Occupant and are invited into the Property on behalf of the Tenant. Guests are permitted to stay on the Property for a period of no more than {{guest_hours}} hours.
i.) Late Fee. The Late Fee accumulates in accordance with the terms mentioned herein and the Governing Law, abiding by any statutory grace periods that may exist. Rent is considered late if not paid on the due date mentioned herein.
j.) Move-In Inspection. A Move-In Inspection, if required under this Agreement or Governing Law, shall be to protect the liability of the Tenant and the Security Deposit. Both Parties must write the Property's condition at the start and the end of the Term.
k.) NSF Fee. If a Non-Sufficient Funds (NSF) Fee is mentioned herein, the amount charged, or the maximum allowed under Governing Law, whichever is greater.
l.) Parking. Any Parking provided by the Landlord shall be at the Tenant's discretion. The Landlord is not responsible for any damage, property loss, or liability that may occur to the Tenant's vehicle.
m.) Pets. If any property repairs, odor removal, or other maintenance is required due to the Tenant's Pets, the costs shall be deducted from the Pet Fee or Security Deposit with an itemized list disclosed to the Tenant.
n.) Pre-Payment of Rent. If applicable, the Pre-Payment of Rent is applied to the dates mentioned herein, the Pre-Payment Period, and cannot be applied to any other timeframe. The Pre-Payment of Rent is non-refundable. Therefore, if the Tenant defaults on the terms of this Agreement and is terminated by the Landlord, they shall not be entitled to a refund of the Pre-Payment of Rent.
o.) Party or Parties. Landlord and Tenant are each referred to herein as a "Party" and, collectively, as the "Parties."
p.) Property. The Property is the residential space permitted to be occupied by the Tenant and Occupants.
q.) Rent. The first payment of Rent shall be due at the execution of this Agreement. All subsequent Rent payments shall be made on the due date in accordance with the payment instructions set forth under Section 5.
r.) Renters Insurance. If required under Section 16, the Tenant agrees to maintain Renters Insurance, in accordance with the minimum liability amounts, for the duration of the Term. It must provide coverage for personal property loss or damage and liability coverage for bodily injury or property damage caused by the Tenant, their guests, or any person affiliated with the Tenant.
s.) Security Deposit. The Security Deposit is paid by the Tenant to the Landlord at the execution of this Agreement under the following terms:
i.) Payment. Payment of the Security Deposit must be made at the execution of this Agreement.
ii.) Returning to Tenant. The Security Deposit will be returned to the Tenant in accordance with the timeframe mentioned or Governing Law, whichever is greater. The timeframe shall start upon the Tenant's delivery of possession to the Landlord at the end of the Term.
iii.) Receipt. If required under Governing Law, the Landlord must provide a receipt for the payment of a Security Deposit.
iv.) Separate Bank Account. If required under Governing Law, the Security Deposit is required to be placed in a separate bank account.
t.) Smoking Policy. Smoking, under this Agreement, is defined as using a 3rd party device to inhale plant-based or non-plant-based substances. This includes vaping or the inhaling of any vapor-like products.
u.) Term. The Term shall be when the Tenant and any Occupants are permitted to reside on the Property.
i.) Standard Lease. If a standard lease is selected in Section 6, and the Landlord does not renew this Agreement by its end date, the Tenant must vacate and deliver possession to the Property by midnight (12:00) local time on the last day of the Term.
ii.) Month-to-Month Lease. If a month-to-month lease is selected in Section 6, either Party may terminate this Agreement by using the Termination Period mentioned or the minimum required under Governing Law, whichever is greater.
v.) Utilities & Services. The Tenant is responsible for any Utilities & Services not mentioned as the Landlord's responsibility.
w.) Violation of this Agreement. If the Tenant violates this Agreement, and more than one individual is named as a Tenant, they shall jointly be liable for all obligations under this Agreement, including but not limited to Rent, damage to the Property, outstanding utility bills, and any other liability.

22. MISCELLANEOUS TERMS
a.) Active Military. Under the Servicemembers Civil Relief Act, the Tenant has the right to terminate this Agreement under permanent change of station or deployment conditions with proper written notice.
b.) Alterations. The Tenant is not allowed to alter, modify, or change the Property in any manner.
c.) Compliance with Local Laws. The Tenant agrees, during the Term, to adhere to all local, State, and Federal laws regarding any ordinances, orders, rules, and regulations.
d.) Delivery and Possession. To the best of their knowledge, the Landlord declares that they will deliver possession of the Property in a habitable condition with all utilities and services in working order.
e.) Dispute Resolution. Should a dispute arise from this Agreement, the Parties agree to attempt an amicable resolution. If unresolved, disputes shall be settled by binding arbitration within the Governing Law.
f.) Equal Housing. If the Tenant possesses any mental or physical impairment, the Landlord shall provide reasonable modifications to the Property unless the modifications would be too difficult or expensive for the Landlord to provide.
g.) Indemnification. The Tenant shall indemnify and hold the Landlord harmless against all losses, damages, liabilities, claims, and expenses (including attorney's fees) incurred by the Landlord arising out of or related to the Tenant's use or occupancy of the Property, except to the extent caused by the gross negligence or willful misconduct of the Landlord.
h.) Maintenance. Any maintenance required to maintain the Property's condition of habitability shall be the Landlord's responsibility, provided that it is not the result of the Tenant's negligence.
i.) Occupancy. Within {{occupancy_accept_hours}} hours of the Tenant's occupancy of the Property, they accept that the Property is in working order and in a habitable condition.
j.) Right of Entry. The Landlord shall have the right to enter the Property, in accordance with Governing Law or by providing {{entry_notice_hours}} hours' notice, whichever is greater, for maintenance, inspections, showings, lease violations, emergencies, or as required by law.
k.) Right of Quiet Enjoyment. Both Parties shall have the right to quiet enjoyment of the Property, which shall not be infringed upon.
l.) Sale of Property. Upon the sale of the Property, the Landlord shall forward the new owner's contact information, and this Agreement shall be assigned to the Landlord accordingly.
m.) Severability. If any provision of this Agreement shall be invalid or unenforceable, the remainder shall be enforced to the maximum extent permitted by law.
n.) Subletting. If Subletting is allowed, the Tenant acknowledges that any subtenants must follow this Agreement and cannot occupy the Property longer than the Term.

23. DEFAULT, EVICTION NOTICE & SHORT-TERM STAY PROVISIONS
a.) Tenant's Default. A default by the Tenant shall occur if the Tenant fails to pay Rent or any other payment required by this Agreement the day after it is due, including any grace periods provided under Governing Law. Default shall also occur if the Tenant violates any other term or condition of this Agreement and fails to cure such violation within {{default_cure_days}} days after receiving written notice of the violation from the Landlord, or the notice period as required under Governing Law, whichever is greater.
b.) Landlord's Default. A default by the Landlord shall occur if the Landlord fails to perform any of its obligations under this Agreement, and such failure continues for {{landlord_default_days}} days after the Tenant gives the Landlord written notice of such failure.
c.) Notice of Default. Any notice required under this section shall be given in writing.
d.) Notice to Vacate: In the event of default or breach of lease terms, Landlord shall issue a 24-Hour Notice to Vacate, which becomes effective immediately upon delivery/submission of the written notice. Under Texas Property Code § 24.005(a), the statutory 3-day notice requirement is expressly overridden by the agreed terms of this written agreement to a shortened 24-hour notice period.
e.) Short-Term Stay & Transient Occupancy Provisions: Pursuant to Texas Property Code Chapter 24 and applicable local ordinances governing short-term, temporary, or transient stays, failure to surrender possession upon the expiration of the 24-hour notice immediately subjects the occupant to expedited eviction procedures, forcible detainer filing, or immediate law enforcement intervention where transient lodging/innkeeper laws apply. The tenant/occupant acknowledges that short-term occupancy rules apply upon default or non-renewal of the month-to-month arrangement.

24. PROHIBITED ACTIONS
a.) Assignment. The Tenant has no rights to assign this Agreement to any other party unless written approval has been granted by the Landlord.
b.) Hazardous Materials. The Tenant agrees not to possess, store, or use any items or substances with flammable or explosive characteristics on the Property.
c.) Illegal Activity. The Tenant agrees to comply with all applicable laws, ordinances, and regulations and shall not engage in any illegal activities anywhere on the Property.
d.) Residential Use Only. The Tenant agrees to use the Property for residential purposes only.
e.) Waterbeds. The Tenant is prohibited from using any type of bed, mattress, or sleeping aid containing any type of liquid.

25. NO CO-SIGNER
{{cosigner_none}} There is no co-signer to this Agreement, who is an individual other than the Tenant that personally guarantees the successful performance of this Agreement.
{{cosigner_yes}} The following co-signer personally guarantees the successful performance of this Agreement:
Co-Signer's Name: {{cosigner_name}}
Co-Signer's Address: {{cosigner_address}}
Co-Signer's Phone: {{cosigner_phone}}

26. ADDITIONAL TERMS & CONDITIONS
1: The rent and utilities are due by the 3rd of the month, late fee of $55.00 applied on the 4th of the month and $10.00 a day after until balance paid in full.
2: The landlord is not responsible for accident, burglaries, thefts, or break in of vehicle or unit.
3: The Tenant:
{{electricity_must}} Must    {{electricity_must_not}} Must Not
Put electricity in their name during the tenure of the lease.
4: No unregistered or non-running vehicles parked on the property at all, landlord will have towed. No vehicles sitting on flats.
5: The front yard must be kept clear and clean at all times. Landlord will charge $35.00 if yard man has to clean or clear trash/debris.
6: Tenant will reimburse landlord for water and gas separate with the rent. Utilities not included with rent.
7: The tenant is responsible for keeping mini split AC filters cleaned at all times. Landlord will charge the tenant cost of repairs if due to tenant negligence.
8: The tenant will be responsible for the cost of the mini split remote control of $100.00 if lost or broken.
9: The tenant must put black trash bin on the street every Monday morning by 7 am, and the green trash bin every other Monday morning by 7 am.
10: Only one parking spot for the unit, all other vehicles must park on the street, and not blocking other tenants. NO parking on the grass!!!
11: Tenant must report leaking/dripping faucets, running toilets, and any water leaks to property manager immediately, or tenant will be responsible for any high water bill.
12: Landlord is not responsible for bedbug treatment.

27. ENTIRE AGREEMENT
This Agreement constitutes the entire understanding between the Parties with regard to the subjects herein. It includes any attachments or addenda and supersedes all prior negotiations, understandings, and agreements among the Parties. Both Landlord and Tenant hereby acknowledge and agree to be bound by the terms and conditions set forth until the expiration or earlier termination of the Term.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first above written. Each Party warrants that they have the legal authority to enter into this Agreement and have done so as their free act and deed.

Landlord's Signature: ______________________________  Date: ______________
Print Name: {{landlord_name}}
Tenant's Signature: ______________________________  Date: ______________
Print Name: {{tenant_name}}
Occupant's Signature (if applicable): ______________________________  Date: ______________
Print Name: ______________________________

28. AMOUNT DUE AT SIGNING
First (1st) Month's Rent: {{due_first_month}}
Security Deposit: {{due_deposit}}
Pre-Paid Rent: {{due_prepaid}}
Pet Fee: {{due_pet_fee}}
Other: {{due_other_label}}  {{due_other_amount}}
Total Due at Signing: {{due_total}}
Initials:  Landlord ______  Tenant ______

29. DISCLOSURE OF INFORMATION ON LEAD-BASED PAINT AND/OR LEAD-BASED PAINT HAZARDS
This disclosure form is for housing built before 1978 and may contain lead-based paint. Lead from paint, paint chips, and dust can pose health hazards if not managed properly. Lead exposure is especially harmful to young children and pregnant women. Before renting pre-1978 housing, lessors must disclose the presence of known lead-based paint and/or lead-based paint hazards in the dwelling. Lessees must also receive a federally approved pamphlet on lead poisoning prevention.

LESSOR'S DISCLOSURE
1. Lead-Based Paint. Presence of lead-based paint and/or hazards: (check one)
{{lead_no_knowledge}} Lessor has no knowledge of lead-based paint and/or lead-based paint hazards in the housing.
{{lead_known}} Known lead-based paint and/or hazards are present in the housing: (explain) {{lead_explain}}
2. Records & Reports. Records and reports to the lessor: (check one)
{{lead_no_reports}} Lessor has no reports or records pertaining to lead-based paint and/or hazards in the housing.
{{lead_has_reports}} Lessor has provided the lessee with all available records and reports pertaining to lead-based paint and/or hazards in the housing. (list documents below) {{lead_reports_list}}

ACKNOWLEDGMENT & SIGNATURE
(initial)
______ Lessee received copies of all information listed above.
______ Lessee received the pamphlet "Protect Your Family from Lead in Your Home."
______ Agent has informed the lessor of the lessor's obligations under 42 U.S.C. 4852d and is aware of his/her responsibility to ensure compliance.

Landlord's Signature: ______________________________  Date: ______________
Tenant's Signature: ______________________________  Date: ______________

30. TEXAS LEASE DISCLOSURES
1.) Agent/Owner Identification - The name and address of the property owner must be mentioned in this Agreement, including any off-site entity responsible for managing the Property.
2.) Copy of Lease - Within three business days of the signature date, the landlord must provide a copy of the executed version of this Agreement to at least one of the Tenants.
3.) Lead-Based Paint Disclosure & EPA Pamphlet - If the residence was constructed before January 1, 1978, the Tenant must be informed and given both disclosure forms.
4.) Parking Rules Addendum - If the Property is located in a multi-unit complex, the Landlord must provide written instructions on the rules regarding parking on the Property.
5.) Right to Cancel - The Tenant can cancel this Agreement at any time if the Tenant is seeking sanctuary from family violence or through military deployment.
6.) 100-Year Flood Plain:
{{flood_yes}} The Landlord is aware that the dwelling you are renting is in a 100-year floodplain.
{{flood_no}} The Landlord is not aware that the dwelling you are renting is in a 100-year floodplain.
7.) Landlord Maintenance - If a landlord fails to maintain the property, tenants must notify them in writing, typically allowing 30 days for repairs.

Initials:  Landlord ______
Tenant ______
"""


class Command(BaseCommand):
    help = 'Seed Neela Texas Residential Lease as the preferred active lease template'

    def handle(self, *args, **options):
        # Prefer this template; keep others but de-prioritize by name preference in generate_lease_pdf
        template, created = LeaseTemplate.objects.get_or_create(
            name=TEMPLATE_NAME,
            defaults={'content': NEELA_TEXAS_LEASE, 'is_active': True},
        )
        if not created:
            template.content = NEELA_TEXAS_LEASE
            template.is_active = True
            template.save(update_fields=['content', 'is_active', 'updated_at'])

        self.stdout.write(self.style.SUCCESS(
            f"{'Created' if created else 'Updated'} active template: {TEMPLATE_NAME} (id={template.id})"
        ))
