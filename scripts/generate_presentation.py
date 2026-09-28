import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

def create_deck(output_paths):
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme Colors
    BG_DARK = RGBColor(11, 17, 32)      # #0b1120 deep navy
    CARD_BG = RGBColor(15, 23, 42)      # #0f172a
    CARD_BORDER = RGBColor(30, 41, 59)  # #1e293b
    CARD_INNER = RGBColor(2, 6, 23)     # #020617
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184)# #94a3b8
    TEXT_DIM = RGBColor(100, 116, 139)  # #64748b
    ACCENT_BLUE = RGBColor(37, 99, 235) # #2563eb
    ACCENT_LIGHT_BLUE = RGBColor(96, 165, 250) # #60a5fa
    ACCENT_RED = RGBColor(239, 68, 68)  # #ef4444
    ACCENT_AMBER = RGBColor(245, 158, 11) # #f59e0b
    ACCENT_GREEN = RGBColor(16, 185, 129) # #10b981
    ACCENT_PURPLE = RGBColor(168, 85, 247) # #a855f7

    def add_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, tag_text, slide_num, total_slides=6):
        # Category Tag
        tag_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(4.5), Inches(0.35))
        tag_box.fill.solid()
        tag_box.fill.fore_color.rgb = RGBColor(23, 37, 84) # dark blue
        tag_box.line.color.rgb = RGBColor(30, 58, 138)
        tag_box.line.width = Pt(1)
        tf = tag_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"  {tag_text.upper()}"
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = ACCENT_LIGHT_BLUE
        p.alignment = PP_ALIGN.LEFT

        # Slide Number
        num_box = slide.shapes.add_textbox(Inches(11.0), Inches(0.35), Inches(1.5), Inches(0.4))
        ntf = num_box.text_frame
        np = ntf.paragraphs[0]
        np.text = f"Slide {slide_num} / {total_slides}"
        np.font.size = Pt(10)
        np.font.bold = True
        np.font.color.rgb = TEXT_DIM
        np.alignment = PP_ALIGN.RIGHT

    def set_speaker_notes(slide, notes_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_text

    # ==========================================
    # SLIDE 1: THE PROBLEM + THE SOLUTION
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    add_background(s1)
    add_header(s1, "First-Round Evaluation • Problem & Solution", 1)

    # Title
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(1.3))
    ttf = t_box.text_frame
    p0 = ttf.paragraphs[0]
    p0.text = "ResQ"
    p0.font.size = Pt(44)
    p0.font.bold = True
    p0.font.color.rgb = TEXT_WHITE
    r1 = p0.add_run()
    r1.text = "Link"
    r1.font.size = Pt(44)
    r1.font.bold = True
    r1.font.color.rgb = ACCENT_LIGHT_BLUE

    p1 = ttf.add_paragraph()
    p1.text = "Emergency resources. Coordinated in real time."
    p1.font.size = Pt(16)
    p1.font.color.rgb = TEXT_MUTED

    # Problem Callout Box
    prob_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.3), Inches(11.733), Inches(1.05))
    prob_box.fill.solid()
    prob_box.fill.fore_color.rgb = CARD_BG
    prob_box.line.color.rgb = CARD_BORDER
    prob_box.line.width = Pt(1)
    ptf = prob_box.text_frame
    ptf.margin_left = Inches(0.3)
    ptf.margin_top = Inches(0.18)
    pp1 = ptf.paragraphs[0]
    pp1.text = "During emergencies, the problem is not always the absence of resources."
    pp1.font.size = Pt(13)
    pp1.font.color.rgb = TEXT_MUTED
    pp2 = ptf.add_paragraph()
    pp2.text = "It is the absence of coordination."
    pp2.font.size = Pt(16)
    pp2.font.bold = True
    pp2.font.color.rgb = TEXT_WHITE

    # 3 Contrast Cards
    card_w = Inches(3.64)
    gap = Inches(0.4)
    y_cards = Inches(3.6)
    h_cards = Inches(1.5)

    # Card 1: Need
    c1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y_cards, card_w, h_cards)
    c1.fill.solid()
    c1.fill.fore_color.rgb = CARD_BG
    c1.line.color.rgb = RGBColor(127, 29, 29) # red border
    c1tf = c1.text_frame
    c1tf.margin_left = c1tf.margin_right = c1tf.margin_top = Inches(0.2)
    p = c1tf.paragraphs[0]
    p.text = "THE NEED"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = ACCENT_RED
    p2 = c1tf.add_paragraph()
    p2.text = "Citizen isolated in flooded district requiring potable drinking water & supplies."
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_WHITE

    # Card 2: Bottleneck
    c2 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8) + card_w + gap, y_cards, card_w, h_cards)
    c2.fill.solid()
    c2.fill.fore_color.rgb = CARD_BG
    c2.line.color.rgb = RGBColor(120, 53, 15) # amber border
    c2tf = c2.text_frame
    c2tf.margin_left = c2tf.margin_right = c2tf.margin_top = Inches(0.2)
    p = c2tf.paragraphs[0]
    p.text = "THE BOTTLENECK"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER
    p2 = c2tf.add_paragraph()
    p2.text = "Distress calls lost in fragmented chat groups, chaotic phone lines & duplicate drops."
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_WHITE

    # Card 3: Resource
    c3 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8) + (card_w + gap)*2, y_cards, card_w, h_cards)
    c3.fill.solid()
    c3.fill.fore_color.rgb = CARD_BG
    c3.line.color.rgb = RGBColor(6, 78, 59) # green border
    c3tf = c3.text_frame
    c3tf.margin_left = c3tf.margin_right = c3tf.margin_top = Inches(0.2)
    p = c3tf.paragraphs[0]
    p.text = "THE RESOURCE"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    p2 = c3tf.add_paragraph()
    p2.text = "Willing community volunteer with transport and rations ready 1.5 km away."
    p2.font.size = Pt(11)
    p2.font.color.rgb = TEXT_WHITE

    # Solution statement & Pillars
    sol_box = s1.shapes.add_textbox(Inches(0.8), Inches(5.3), Inches(11.733), Inches(0.8))
    stf = sol_box.text_frame
    sp = stf.paragraphs[0]
    sp.text = "ResQLink connects people who need emergency resources with the right available responders through a centralized, priority-driven coordination platform."
    sp.font.size = Pt(12)
    sp.font.color.rgb = TEXT_MUTED

    # Pillars
    pil_box = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(6.3), Inches(11.733), Inches(0.6))
    pil_box.fill.solid()
    pil_box.fill.fore_color.rgb = CARD_BG
    pil_box.line.color.rgb = CARD_BORDER
    ptf = pil_box.text_frame
    pp = ptf.paragraphs[0]
    pp.alignment = PP_ALIGN.CENTER
    pp.text = "01  REQUEST (Pinpoint Need)    -->    02  MATCH (Priority & Radius)    -->    03  RESOLVE (Verified Delivery)"
    pp.font.size = Pt(11)
    pp.font.bold = True
    pp.font.color.rgb = ACCENT_LIGHT_BLUE

    set_speaker_notes(s1, "Good morning, judges. During seasonal floods, cyclones, and civic emergencies, essential resources like drinking water and ration kits are often present in the disaster zone. The real breakdown is coordination: distress calls are scattered across informal chat groups and unverified social media feeds, while nearby responders lack actionable location data. We built ResQLink to bridge this exact gap: an intelligent full-stack coordination grid that connects citizen needs directly to verified field volunteers.")

    # ==========================================
    # SLIDE 2: HOW RESQLINK WORKS
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_background(s2)
    add_header(s2, "Rubric: Functionality & Requirements • 5 Marks", 2)

    t_box = s2.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(0.9))
    ttf = t_box.text_frame
    p0 = ttf.paragraphs[0]
    p0.text = "How ResQLink Works"
    p0.font.size = Pt(28)
    p0.font.bold = True
    p0.font.color.rgb = TEXT_WHITE
    p1 = ttf.add_paragraph()
    p1.text = "One platform connecting the complete emergency-resource lifecycle."
    p1.font.size = Pt(13)
    p1.font.color.rgb = TEXT_MUTED

    # 6 Steps Grid
    step_w = Inches(1.82)
    step_gap = Inches(0.16)
    y_steps = Inches(1.9)
    h_steps = Inches(2.2)

    steps_data = [
        ("01 CITIZEN", "Create Request", "Selects resource type, affected count, urgency, and pinpoint coordinates via Google Maps.", ACCENT_LIGHT_BLUE),
        ("02 SYSTEM", "Evaluate Priority", "Multi-factor algorithm computes urgency score (0-100) based on severity & mortality.", ACCENT_LIGHT_BLUE),
        ("03 MATCHING", "Find Volunteers", "Evaluates Haversine distance, travel radius, vehicle type, and active workload.", ACCENT_LIGHT_BLUE),
        ("04 VOLUNTEER", "Accept Mission", "Responder locks request; transactional database lock prevents duplicate dispatch.", ACCENT_LIGHT_BLUE),
        ("05 TRANSIT", "Fulfill Delivery", "Status moves to In-Progress; citizen monitors live progress bar & contact details.", ACCENT_LIGHT_BLUE),
        ("06 RESOLVE", "Confirm Receipt", "Citizen verifies supply handover; request closes and volunteer stats increment.", ACCENT_GREEN)
    ]

    for i, (tag, title, desc, col) in enumerate(steps_data):
        x = Inches(0.8) + i * (step_w + step_gap)
        sb = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y_steps, step_w, h_steps)
        sb.fill.solid()
        sb.fill.fore_color.rgb = CARD_BG
        sb.line.color.rgb = CARD_BORDER
        sb.line.width = Pt(1)
        stf = sb.text_frame
        stf.margin_left = stf.margin_right = stf.margin_top = Inches(0.12)
        p = stf.paragraphs[0]
        p.text = tag
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = col
        p2 = stf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p3 = stf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(9)
        p3.font.color.rgb = TEXT_MUTED

    # State Machine Box (Left)
    sm_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.35), Inches(7.5), Inches(2.4))
    sm_box.fill.solid()
    sm_box.fill.fore_color.rgb = CARD_BG
    sm_box.line.color.rgb = CARD_BORDER
    smtf = sm_box.text_frame
    smtf.margin_left = Inches(0.25)
    smtf.margin_top = Inches(0.2)
    p = smtf.paragraphs[0]
    p.text = "VERIFIED REQUEST STATE MACHINE TRANSITIONS"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = ACCENT_LIGHT_BLUE

    p2 = smtf.add_paragraph()
    p2.text = "PENDING  -->  VERIFIED  -->  ASSIGNED  -->  IN_PROGRESS  -->  DELIVERED  -->  CLOSED"
    p2.font.size = Pt(11)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE

    p3 = smtf.add_paragraph()
    p3.text = "\n• Valid Transitions Enforced: Programmatically checked in request.service.ts before persistence."
    p3.font.size = Pt(10)
    p3.font.color.rgb = TEXT_MUTED
    p4 = smtf.add_paragraph()
    p4.text = "• Invalid Jumps Blocked: Skipping directly from Pending to Closed or Assigned to Confirmed is rejected."
    p4.font.size = Pt(10)
    p4.font.color.rgb = TEXT_MUTED
    p5 = smtf.add_paragraph()
    p5.text = "• Delivery Dispute Protection: Citizens can contest unfulfilled deliveries, alerting operations admin."
    p5.font.size = Pt(10)
    p5.font.color.rgb = TEXT_MUTED

    # Roles Box (Right)
    r_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.5), Inches(4.35), Inches(4.033), Inches(2.4))
    r_box.fill.solid()
    r_box.fill.fore_color.rgb = CARD_BG
    r_box.line.color.rgb = CARD_BORDER
    rtf = r_box.text_frame
    rtf.margin_left = Inches(0.25)
    rtf.margin_top = Inches(0.2)
    p = rtf.paragraphs[0]
    p.text = "THREE DEDICATED USER PORTALS"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = ACCENT_LIGHT_BLUE

    roles_data = [
        ("Citizen Portal", "Submit distress calls, edit pins, track live telemetry & confirm delivery."),
        ("Volunteer Hub", "Proximity radar, availability toggle, and one-click mission acceptance."),
        ("Admin Console", "Macro Tamil Nadu crisis map, volunteer verification desk, & audit trail.")
    ]
    for r_title, r_desc in roles_data:
        rp = rtf.add_paragraph()
        rp.text = f"• {r_title}: "
        rp.font.size = Pt(10)
        rp.font.bold = True
        rp.font.color.rgb = TEXT_WHITE
        run = rp.add_run()
        run.text = r_desc
        run.font.bold = False
        run.font.color.rgb = TEXT_MUTED

    set_speaker_notes(s2, "Here is the complete six-step workflow: A citizen logs an incident with coordinates; our system calculates an objective priority score; nearby verified volunteers within traveling radius are alerted; the first responder locks the assignment transactionally; and upon delivery, the citizen confirms receipt to close the loop. Every state transition is strictly validated and recorded in our permanent audit log.")

    # ==========================================
    # SLIDE 3: THE INTELLIGENCE BEHIND THE SYSTEM
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_background(s3)
    add_header(s3, "Rubric: Innovation & Technical Novelty • 5 Marks", 3)

    t_box = s3.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(0.9))
    ttf = t_box.text_frame
    p0 = ttf.paragraphs[0]
    p0.text = "The Intelligence Behind the System"
    p0.font.size = Pt(28)
    p0.font.bold = True
    p0.font.color.rgb = TEXT_WHITE
    p1 = ttf.add_paragraph()
    p1.text = "ResQLink does not simply record emergency requests — it coordinates what happens next."
    p1.font.size = Pt(13)
    p1.font.color.rgb = TEXT_MUTED

    # Dual Engine Cards
    y_engine = Inches(1.9)
    w_engine = Inches(5.7)
    h_engine = Inches(4.3)

    # Priority Engine Box
    pe_box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y_engine, w_engine, h_engine)
    pe_box.fill.solid()
    pe_box.fill.fore_color.rgb = CARD_BG
    pe_box.line.color.rgb = CARD_BORDER
    petf = pe_box.text_frame
    petf.margin_left = petf.margin_right = Inches(0.3)
    petf.margin_top = Inches(0.25)
    p = petf.paragraphs[0]
    p.text = "PRIORITY SCORING ENGINE (Max 100 pts)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_RED

    p2 = petf.add_paragraph()
    p2.text = "Objective triage algorithm ranking acute distress before notification:"
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_MUTED

    pe_factors = [
        ("Acute Severity Rating (Max 40 pts)", "Critical (40) immediate life-safety threat; High (28) urgent response; Normal (15) standard replenishment."),
        ("Vulnerable Population Scale (Max 30 pts)", "20+ persons (30 pts), 10+ (24 pts), 5+ (18 pts), 2-4 (10 pts), individual (5 pts)."),
        ("Resource Mortality Index (Max 20 pts)", "Water (20 pts) > Shelter (18 pts) > Food (15 pts) > Transport (12 pts) > Supplies (8 pts)."),
        ("Starvation Prevention Aging (Max 10 pts)", "Adds +2.5 pts for every unaddressed hour in queue to ensure normal requests are not perpetually starved.")
    ]
    for ft, fd in pe_factors:
        p = petf.add_paragraph()
        p.text = f"\n• {ft}"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p_sub = petf.add_paragraph()
        p_sub.text = f"  {fd}"
        p_sub.font.size = Pt(9)
        p_sub.font.color.rgb = TEXT_MUTED

    # Matching Engine Box
    me_box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.833), y_engine, w_engine, h_engine)
    me_box.fill.solid()
    me_box.fill.fore_color.rgb = CARD_BG
    me_box.line.color.rgb = CARD_BORDER
    metf = me_box.text_frame
    metf.margin_left = metf.margin_right = Inches(0.3)
    metf.margin_top = Inches(0.25)
    p = metf.paragraphs[0]
    p.text = "RESPONDER MATCHING ENGINE (Haversine Math)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_LIGHT_BLUE

    p2 = metf.add_paragraph()
    p2.text = "Ranks candidate volunteers by true geographical proximity & operational fit:"
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_MUTED

    me_factors = [
        ("Proximity Ratio (Max 40 pts)", "Computed via Haversine Great-Circle formula: 1 - (dist / radius). Strict filter discards outside service radius."),
        ("Active Workload & Capacity (Max 25 pts)", "0 active tasks (25 pts), 1 active task (15 pts), 2 tasks (8 pts). Prevents task overload."),
        ("Resource Capability Alignment (20 pts)", "Direct match between verified volunteer equipment/inventory and citizen resource requirement."),
        ("Reliability Rating & Experience (Max 10 pts)", "Weighted score combining verified rating (6 pts) and total completed delivery missions (4 pts).")
    ]
    for ft, fd in me_factors:
        p = metf.add_paragraph()
        p.text = f"\n• {ft}"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p_sub = metf.add_paragraph()
        p_sub.text = f"  {fd}"
        p_sub.font.size = Pt(9)
        p_sub.font.color.rgb = TEXT_MUTED

    # Technical Callout Bottom Strip
    callout = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(6.35), Inches(11.733), Inches(0.55))
    callout.fill.solid()
    callout.fill.fore_color.rgb = CARD_INNER
    callout.line.color.rgb = CARD_BORDER
    ctf = callout.text_frame
    cp = ctf.paragraphs[0]
    cp.alignment = PP_ALIGN.CENTER
    cp.text = "Explainable AI Telemetry: Responders & citizens can click any priority score to inspect the exact mathematical point breakdown."
    cp.font.size = Pt(10)
    cp.font.bold = True
    cp.font.color.rgb = ACCENT_LIGHT_BLUE

    set_speaker_notes(s3, "Notice our innovation: we do not guess priority. Our engine uses a 4-factor formula factoring in severity, affected headcount, resource mortality, and wait-time aging so no citizen is starved. Volunteers are ranked via Haversine distance, workload capacity, and skills. Furthermore, our frontend includes an Explainable Priority Rationale modal where judges can see the exact math behind every score.")

    # ==========================================
    # SLIDE 4: FULL-STACK TECHNICAL ARCHITECTURE
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_background(s4)
    add_header(s4, "Rubric: Technical Implementation • 5 Marks", 4)

    t_box = s4.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(0.9))
    ttf = t_box.text_frame
    p0 = ttf.paragraphs[0]
    p0.text = "Full-Stack Technical Architecture"
    p0.font.size = Pt(28)
    p0.font.bold = True
    p0.font.color.rgb = TEXT_WHITE
    p1 = ttf.add_paragraph()
    p1.text = "Engineered for operational durability, strict transaction integrity, and sub-100ms interactions."
    p1.font.size = Pt(13)
    p1.font.color.rgb = TEXT_MUTED

    # 3-Tier Layer Boxes
    y_arch = Inches(1.9)
    w_arch = Inches(3.64)
    h_arch = Inches(3.3)
    gap_arch = Inches(0.4)

    # Presentation Layer
    l1 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y_arch, w_arch, h_arch)
    l1.fill.solid()
    l1.fill.fore_color.rgb = CARD_BG
    l1.line.color.rgb = CARD_BORDER
    l1tf = l1.text_frame
    l1tf.margin_left = l1tf.margin_right = l1tf.margin_top = Inches(0.2)
    p = l1tf.paragraphs[0]
    p.text = "PRESENTATION LAYER"
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = ACCENT_LIGHT_BLUE
    p2 = l1tf.add_paragraph()
    p2.text = "Next.js 14 App Router"
    p2.font.size = Pt(13)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p3 = l1tf.add_paragraph()
    p3.text = "\n• React 18 Server & Client Components\n• Tailwind CSS Design System Tokens\n• Leaflet.js Tactical Emergency Map\n• Dynamic Widescreen Grid (4 cols)\n• Zero Emojis / 100% Vector Lucide Icons\n• Mobile Bottom Navigation Bar"
    p3.font.size = Pt(10)
    p3.font.color.rgb = TEXT_MUTED

    # Business Logic Layer
    l2 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8) + w_arch + gap_arch, y_arch, w_arch, h_arch)
    l2.fill.solid()
    l2.fill.fore_color.rgb = CARD_BG
    l2.line.color.rgb = CARD_BORDER
    l2tf = l2.text_frame
    l2tf.margin_left = l2tf.margin_right = l2tf.margin_top = Inches(0.2)
    p = l2tf.paragraphs[0]
    p.text = "BUSINESS LOGIC LAYER"
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    p2 = l2tf.add_paragraph()
    p2.text = "API & Engine Services"
    p2.font.size = Pt(13)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p3 = l2tf.add_paragraph()
    p3.text = "\n• Priority Scoring Service (4 factors)\n• Matching Service (Haversine math)\n• Request Lifecycle State Machine\n• Bcrypt (10 rounds) + Role RBAC\n• Audit Logger Service (AuditLog)\n• In-App Notification Broadcaster"
    p3.font.size = Pt(10)
    p3.font.color.rgb = TEXT_MUTED

    # Persistence Layer
    l3 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8) + (w_arch + gap_arch)*2, y_arch, w_arch, h_arch)
    l3.fill.solid()
    l3.fill.fore_color.rgb = CARD_BG
    l3.line.color.rgb = CARD_BORDER
    l3tf = l3.text_frame
    l3tf.margin_left = l3tf.margin_right = l3tf.margin_top = Inches(0.2)
    p = l3tf.paragraphs[0]
    p.text = "PERSISTENCE LAYER"
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = ACCENT_PURPLE
    p2 = l3tf.add_paragraph()
    p2.text = "Prisma ORM + SQLite"
    p2.font.size = Pt(13)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p3 = l3tf.add_paragraph()
    p3.text = "\n• 7 Relational Database Models\n• Atomic prisma.$transaction Blocks\n• Automated Session Healing Logic\n• Indexed Coordinates & Status Enums\n• Verified Tamil Nadu Seed Dataset\n• Foreign Key Cascade Safety"
    p3.font.size = Pt(10)
    p3.font.color.rgb = TEXT_MUTED

    # Verified Technical Metrics Badges
    y_metric = Inches(5.4)
    h_metric = Inches(1.3)
    m_w = Inches(2.7)
    m_gap = Inches(0.31)

    metrics = [
        ("22", "REST API Endpoints", "Clean HTTP handlers with auth guards"),
        ("35", "Compiled Routes", "Next.js 14 production verified"),
        ("7 / 7", "Automated Test Suites", "100% passing math & lifecycle suite"),
        ("0", "TypeScript Errors", "Strict type-checking via tsc --noEmit")
    ]

    for i, (m_val, m_title, m_sub) in enumerate(metrics):
        mx = Inches(0.8) + i * (m_w + m_gap)
        mb = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx, y_metric, m_w, h_metric)
        mb.fill.solid()
        mb.fill.fore_color.rgb = CARD_INNER
        mb.line.color.rgb = CARD_BORDER
        mtf = mb.text_frame
        mtf.margin_top = Inches(0.15)
        p = mtf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = m_val
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = ACCENT_LIGHT_BLUE
        p2 = mtf.add_paragraph()
        p2.alignment = PP_ALIGN.CENTER
        p2.text = m_title
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p3 = mtf.add_paragraph()
        p3.alignment = PP_ALIGN.CENTER
        p3.text = m_sub
        p3.font.size = Pt(8)
        p3.font.color.rgb = TEXT_DIM

    set_speaker_notes(s4, "Under the hood, this is a clean full-stack Next.js 14 architecture with Prisma ORM and SQLite. We have 22 REST endpoints, strict transactional locking, 7 out of 7 automated test suites passing, and zero TypeScript compiler errors across 35 compiled routes. Race conditions during assignment are prevented using atomic database transactions.")

    # ==========================================
    # SLIDE 5: UI/UX + PRODUCT EXPERIENCE
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_background(s5)
    add_header(s5, "Rubric: UI/UX & Frontend Design • 5 Marks", 5)

    t_box = s5.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(0.9))
    ttf = t_box.text_frame
    p0 = ttf.paragraphs[0]
    p0.text = "UI/UX & Product Experience"
    p0.font.size = Pt(28)
    p0.font.bold = True
    p0.font.color.rgb = TEXT_WHITE
    p1 = ttf.add_paragraph()
    p1.text = "High-contrast emergency command aesthetic designed for instant field comprehension under pressure."
    p1.font.size = Pt(13)
    p1.font.color.rgb = TEXT_MUTED

    # 4 Product Showcase Tiles
    y_tiles = Inches(1.9)
    w_tile = Inches(2.7)
    h_tile = Inches(4.0)
    gap_tile = Inches(0.31)

    tiles_data = [
        ("CITIZEN PORTAL", "Multi-Step Request Wizard", "5-step progressive disclosure wizard with embedded Google Maps coordinate selector, regional district presets (Chennai, Madurai, Salem), and live telemetry progress bar.", "Pinpoint GPS Picker", ACCENT_LIGHT_BLUE),
        ("VOLUNTEER HUB", "Radius Proximity Radar", "Real-time feed showing distance in kilometers, supplies required, affected individuals count, vehicle capability tags, and 1-click mission acceptance.", "Proximity Distance Feed", ACCENT_GREEN),
        ("ADMIN CONSOLE", "Command Grid & Map", "Tactical Tamil Nadu Leaflet map with pulsing critical hazard markers, volunteer verification desk, priority override controls, and permanent audit trail.", "Pulsing Hazard Symbology", ACCENT_RED),
        ("EXPLAINABLE AI", "Priority Rationale Modal", "Clickable score rationale trigger on every request card breaking down exact points contributing to an incident's priority score for complete trust.", "Transparent Triage Math", ACCENT_PURPLE)
    ]

    for i, (t_tag, t_title, t_desc, t_foot, col) in enumerate(tiles_data):
        tx = Inches(0.8) + i * (w_tile + gap_tile)
        tb = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tx, y_tiles, w_tile, h_tile)
        tb.fill.solid()
        tb.fill.fore_color.rgb = CARD_BG
        tb.line.color.rgb = CARD_BORDER
        tbtf = tb.text_frame
        tbtf.margin_left = tbtf.margin_right = Inches(0.2)
        tbtf.margin_top = Inches(0.2)
        p = tbtf.paragraphs[0]
        p.text = t_tag
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = col
        p2 = tbtf.add_paragraph()
        p2.text = t_title
        p2.font.size = Pt(12)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p3 = tbtf.add_paragraph()
        p3.text = f"\n{t_desc}"
        p3.font.size = Pt(10)
        p3.font.color.rgb = TEXT_MUTED

        # Bottom pill inside tile
        p4 = tbtf.add_paragraph()
        p4.text = f"\n• {t_foot}"
        p4.font.size = Pt(9)
        p4.font.bold = True
        p4.font.color.rgb = col

    # Bottom Design Tenets Bar
    tenets = s5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(6.1), Inches(11.733), Inches(0.65))
    tenets.fill.solid()
    tenets.fill.fore_color.rgb = CARD_INNER
    tenets.line.color.rgb = CARD_BORDER
    ttf = tenets.text_frame
    tp = ttf.paragraphs[0]
    tp.alignment = PP_ALIGN.CENTER
    tp.text = "DESIGN SYSTEM: Full Widescreen Fluid Grid  •  Zero Emojis (Vector Lucide Only)  •  Mobile Bottom Bar  •  108 Indian Life-Safety Notice"
    tp.font.size = Pt(10)
    tp.font.bold = True
    tp.font.color.rgb = TEXT_MUTED

    set_speaker_notes(s5, "Our frontend is built for crisis conditions: high-contrast dark palette, zero emojis, full-screen widescreen grid scaling, mobile bottom bar, and our unique Explainable Priority Rationale modal where judges can see the exact math behind every triage score. The design adheres to modern enterprise SaaS standards.")

    # ==========================================
    # SLIDE 6: IMPACT + DEMO + CLOSING
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_background(s6)
    add_header(s6, "Conclusion & Live Demonstration", 6)

    # Title
    t_box = s6.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(0.9))
    ttf = t_box.text_frame
    p0 = ttf.paragraphs[0]
    p0.text = "From emergency requests to coordinated response."
    p0.font.size = Pt(28)
    p0.font.bold = True
    p0.font.color.rgb = TEXT_WHITE

    # Value Chain Box
    vc_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.85), Inches(11.733), Inches(0.85))
    vc_box.fill.solid()
    vc_box.fill.fore_color.rgb = CARD_BG
    vc_box.line.color.rgb = CARD_BORDER
    vctf = vc_box.text_frame
    vctf.margin_top = Inches(0.18)
    vp = vctf.paragraphs[0]
    vp.alignment = PP_ALIGN.CENTER
    vp.text = "CITIZEN (Needs Help)    -->    RESQLINK (Scores & Matches)    -->    VOLUNTEER (Delivers)    -->    RESOLUTION (Confirmed)"
    vp.font.size = Pt(11)
    vp.font.bold = True
    vp.font.color.rgb = ACCENT_LIGHT_BLUE

    # 3 Differentiators Cards
    diff_w = Inches(3.64)
    y_diff = Inches(2.9)
    h_diff = Inches(1.6)

    diffs = [
        ("01", "Priority-Aware Triage", "Automated multi-factor scoring (severity, population, mortality, wait aging) prevents triage bottlenecks during disasters.", ACCENT_LIGHT_BLUE),
        ("02", "Location-Aware Matching", "Real Haversine Great-Circle math routes supplies to the nearest available responder with capability alignment.", ACCENT_LIGHT_BLUE),
        ("03", "End-to-End Visibility", "Complete audit trail, volunteer verification, and recipient confirmation prevent lost aid or abandoned requests.", ACCENT_LIGHT_BLUE)
    ]

    for i, (num, d_title, d_desc, col) in enumerate(diffs):
        dx = Inches(0.8) + i * (diff_w + gap_arch)
        db = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, dx, y_diff, diff_w, h_diff)
        db.fill.solid()
        db.fill.fore_color.rgb = CARD_BG
        db.line.color.rgb = CARD_BORDER
        dtf = db.text_frame
        dtf.margin_left = dtf.margin_right = dtf.margin_top = Inches(0.15)
        p = dtf.paragraphs[0]
        p.text = f"{num}  {d_title}"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p2 = dtf.add_paragraph()
        p2.text = f"\n{d_desc}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = TEXT_MUTED

    # 60-Second Demo Sequence Box
    demo_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.7), Inches(11.733), Inches(1.15))
    demo_box.fill.solid()
    demo_box.fill.fore_color.rgb = CARD_INNER
    demo_box.line.color.rgb = RGBColor(30, 58, 138)
    demo_box.line.width = Pt(1)
    dtf = demo_box.text_frame
    dtf.margin_left = Inches(0.25)
    dtf.margin_top = Inches(0.15)
    p = dtf.paragraphs[0]
    p.text = "60-SECOND LIVE DEMONSTRATION WALKTHROUGH"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = ACCENT_LIGHT_BLUE
    p2 = dtf.add_paragraph()
    p2.text = "1. Create Request with Google Maps Pin  -->  2. Inspect Priority Rationale (78 pts)  -->  3. Match Volunteer via Radar\n4. Start Transit & Fulfill Delivery  -->  5. Confirm Receipt & Close Ticket  -->  6. View Permanent Audit Trail"
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_WHITE

    # Closing Tagline
    close_box = s6.shapes.add_textbox(Inches(0.8), Inches(6.05), Inches(11.733), Inches(0.9))
    ctf = close_box.text_frame
    cp = ctf.paragraphs[0]
    cp.text = "RESQLINK"
    cp.font.size = Pt(18)
    cp.font.bold = True
    cp.font.color.rgb = TEXT_WHITE
    r = cp.add_run()
    r.text = "   •   Coordinate. Respond. Resolve."
    r.font.size = Pt(16)
    r.font.bold = False
    r.font.color.rgb = ACCENT_LIGHT_BLUE

    set_speaker_notes(s6, "To conclude, ResQLink bridges the gap between chaotic distress beacons and verified fulfillment. We are ready to show you our 60-second live demonstration starting from request creation to delivery confirmation. ResQLink: Coordinate. Respond. Resolve.")

    # Save to all requested locations
    for path in output_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        prs.save(path)
        print(f"Saved: {path}")

if __name__ == "__main__":
    paths = [
        r"c:\Users\karth\OneDrive\Desktop\hackathon\public\resqlink_presentation.pptx",
        r"c:\Users\karth\OneDrive\Desktop\hackathon\resqlink_presentation.pptx",
        r"C:\Users\karth\.gemini\antigravity\brain\5f2271b9-d4b6-4fcd-bd7e-38835a734699\resqlink_presentation.pptx"
    ]
    create_deck(paths)
