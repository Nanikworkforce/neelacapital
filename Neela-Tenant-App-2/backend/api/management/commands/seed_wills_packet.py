from django.core.management.base import BaseCommand
from api.models import LeaseTemplate


WILLS_LEASE_APPLICATION = """NEELA CAPITAL INVESTMENTS
6705 Sherman Street, Houston, Texas 77011 | (832) 621-6126 | neelacapital.com

NEELA REAL ESTATE SUBMISSION INSTRUCTIONS & APPLICATION REQUIREMENTS

Please submit the completed lease application with:
• Copy of all applicant's photo IDs
• Proof of income - Should be 3x the rent
• Proof of employment - pay stubs or letter from employer
• Current email addresses and phone numbers

Income Documentation Clarification: The stated three-times-rent income criterion must be read together with Landlord's disclosed tenant selection criteria.

--------------------------------------------------------------------------------

1. PROPERTY & LEASE REQUEST DETAILS

Property Address: {{property_unit}}
Anticipated Move-in Date: {{move_in_date}}    Monthly Rent: {{rent_amount}}    Security Deposit: {{deposit_amount}}

LEASE TERM NOTE:
The tenancy established under this agreement is strictly month-to-month. A 12-month fixed-term lease shall not take effect or be enforceable unless and until prior written approval for a 12-month lease is formally executed by the Landlord. Verbal representations or ongoing discussions alone do not establish a 12-month tenancy.

DEFAULT, EVICTION NOTICE & SHORT-TERM STAY PROVISIONS:

Notice to Vacate: In the event of default or breach of lease terms, Landlord shall issue a 24-Hour Notice to Vacate, which becomes effective immediately upon delivery/submission of the written notice. Under Texas Property Code § 24.005(a), the statutory 3-day notice requirement is expressly overridden by the agreed terms of this written agreement to a shortened 24-hour notice period.

Short-Term Stay & Transient Occupancy Provisions: Pursuant to Texas Property Code Chapter 24 and applicable local ordinances governing short-term, temporary, or transient stays, failure to surrender possession upon the expiration of the 24-hour notice immediately subjects the occupant to expedited eviction procedures, forcible detainer filing, or immediate law enforcement intervention where transient lodging/innkeeper laws apply. The tenant/occupant acknowledges that short-term occupancy rules apply upon default or non-renewal of the month-to-month arrangement.

--------------------------------------------------------------------------------

2. PROPERTY CONDITION & REQUESTED REPAIRS

Applicant accepts the Property in its present "as is" condition, subject only to any specific written repair requests approved by Landlord prior to move-in. Landlord-provided furniture, appliances, or inventory shall remain property of Landlord and must be maintained in good working order by Tenant.

Requested Repairs (if none, write "NONE"):
1. _________________________________________________________________________________
2. _________________________________________________________________________________

--------------------------------------------------------------------------------

3. APPLICANT INFORMATION

Full Legal Name: {{tenant_name}}    Former Name / Maiden Name: ______________________
Date of Birth: {{date_of_birth}}    SSN/ITIN: ___________________    Driver's License No. & State: ______________________
Cell/Home Phone: {{tenant_phone}}    Email Address: {{tenant_email}}
Emergency Contact Name: {{emergency_contact_name}}    Relationship: {{emergency_contact_relationship}}    Phone: {{emergency_contact_phone}}

--------------------------------------------------------------------------------

4. OTHER OCCUPANTS & RESIDENCE HISTORY

Other Occupants (List all persons who will reside in the property):
{{occupants_detailed}}

Current Address: {{tenant_current_address}}
City: _______________ State: ____ Zip: _______
Dates of Occupancy: From: _________ To: _________    Monthly Rent/Mortgage: $________    Reason for Moving: ________________
Current Landlord/Mortgage Co.: _______________________________________ Phone: ___________________________

--------------------------------------------------------------------------------

5. PREVIOUS RESIDENCE & EMPLOYMENT HISTORY

Previous Address: {{previous_address}}
City: _______________ State: ____ Zip: _______
Previous Landlord: {{previous_landlord_name}}    Phone: {{previous_landlord_phone}}

Current Employer: {{employer}}    Position: {{job_title}}    Supervisor: {{supervisor_name}}
Employer Address: _____________________________________ Phone: __________________ Start Date: {{employment_start_date}}
Gross Monthly Income: {{monthly_income}}    Other Income (Monthly): $____________    Source: __________________________

*Self-employed applicants must provide two consecutive years of complete federal tax returns and 3 months of bank statements to substantiate gross income.

--------------------------------------------------------------------------------

6. VEHICLES & PETS

Vehicle 1: Make: ____________ Model: ____________ Year: ______ Color: ________ License Plate: __________ State: ____
Vehicle 2: Make: ____________ Model: ____________ Year: ______ Color: ________ License Plate: __________ State: ____

Pets (if any): Type/Breed: {{pets_description}}    Weight: ______ Age: ____    Vaccinations Up to Date? [ ] Yes [ ] No
Pet Bite/Aggression History: [ ] Yes [ ] No (If yes, provide details: _____________________________________________)

--------------------------------------------------------------------------------

7. GENERAL INFORMATION & BACKGROUND QUESTIONS

1. Have you ever been evicted, asked to move out, or broken a rental agreement? {{eviction_yes}} Yes {{eviction_no}} No
2. Have you ever declared bankruptcy? [ ] Yes [ ] No
3. Have you ever been convicted of or pled guilty/no contest to a felony or misdemeanor? {{felony_yes}} Yes {{felony_no}} No
4. Do you smoke or use e-cigarettes/vaping products? {{smokes_yes}} Yes {{smokes_no}} No
5. Do you agree to maintain renter's insurance during the entire tenancy? [ ] Yes [ ] No
6. Are you currently serving on active military duty? [ ] Yes [ ] No

--------------------------------------------------------------------------------

8. AUTHORIZATION, FEES & ACKNOWLEDGEMENT

Applicant represents that all information provided in this application is true, complete, and accurate. Applicant understands that any misrepresentation, falsification, or omission of facts is grounds for rejection of this application or immediate termination of tenancy if discovered post-occupancy.

Applicant acknowledges payment of a non-refundable application fee. Applicant authorizes Landlord and its representatives to enter and show the property during reasonable notice periods as provided by law. Landlord complies with applicable privacy regulations and protects confidential applicant information.

Applicant Signature: _________________________________________________ Date: ______________________

--------------------------------------------------------------------------------

9. AUTHORIZATION TO RELEASE INFORMATION

I hereby authorize my current and former employers, current and previous landlords, mortgage lenders, financial institutions, consumer reporting agencies, and law enforcement agencies to release any and all verification information concerning my employment, rental history, financial accounts, credit history, and criminal background to Neela Capital Investments and its authorized agents.

Applicant Signature: _________________________________________________ Date: ______________________
"""


WILLS_AUTHORIZATION_RELEASE = """NEELA CAPITAL INVESTMENTS
AUTHORIZATION TO RELEASE INFORMATION

Residential Lease Application concerning {{property_unit}}

I, {{tenant_name}} (Applicant), have submitted an application to lease a property located at {{property_unit}}.

The landlord, broker, or landlord's representative is:
{{landlord_name}}
{{landlord_address}}
{{landlord_phone}}
{{landlord_email}}

I hereby authorize my current and former employers, current and previous landlords, mortgage lenders, financial institutions, consumer reporting agencies, and law enforcement agencies to release any and all verification information concerning my employment, rental history, financial accounts, credit history, and criminal background to Neela Capital Investments and its authorized agents.

Applicant's Signature: ___________________________________
Date: {{current_date}}
"""


class Command(BaseCommand):
    help = 'Seeds Neela Real Estate lease application + authorization templates'

    def handle(self, *args, **kwargs):
        LeaseTemplate.objects.filter(
            name__in=[
                'Wills Lease Packet',
                'Wills Residential Lease Application',
                'Wills Authorization to Release Information',
            ]
        ).update(is_active=False)

        specs = [
            ('Residential Lease Application', WILLS_LEASE_APPLICATION),
            ('Authorization to Release Information', WILLS_AUTHORIZATION_RELEASE),
        ]

        for name, content in specs:
            template, created = LeaseTemplate.objects.get_or_create(
                name=name,
                defaults={'content': content, 'is_active': True},
            )
            if not created:
                template.content = content
                template.is_active = True
                template.save(update_fields=['content', 'is_active', 'updated_at'])
                self.stdout.write(self.style.SUCCESS(f'Updated "{name}"'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Created "{name}"'))

        LeaseTemplate.objects.filter(name='Standard Residential Lease').update(is_active=True)
        self.stdout.write(self.style.SUCCESS('Neela Real Estate lease templates ready.'))
