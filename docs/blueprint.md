# **App Name**: AgriAlumni Connect

## Core Features:

- Intuitive Navigation & Public Content Access: Seamlessly navigate between public (Beranda, Berita Alumni) and protected zones, featuring a prominent hero section, key statistics, and a news feed with category filtering and detailed article views.
- Secure Alumni Authentication: Simulated user login and logout functionality via a selector modal, granting appropriate access to protected sections of the portal.
- Comprehensive Career Hub: Browse job listings with various filters, view detailed job descriptions, and allow authorized alumni or lecturers to post new job opportunities for the community.
- Dynamic Expert Directory: Explore an alumni expertise directory with powerful search and filter capabilities to identify potential collaborators or mentors by skills and availability.
- Interactive Tracer Study: A guided multi-step form to efficiently collect and update alumni career progression data, including valuable feedback for curriculum enhancement.
- Collaborative Forum Systems: Dedicated platforms for initiating and participating in research collaboration threads and general alumni discussions, with functionality for creating and interacting with posts.
- Personalized Alumni Dashboard: A tailored view summarizing the logged-in user's profile information, key metrics, and activity history within the portal.

## Style Guidelines:

- The overall scheme utilizes a light background for clarity. The palette is anchored by the institutional identity of IPB, leveraging Forest Green for academic rigor and Gold for prestige and highlight.
- Primary Institutional Green: '#2E7D32', used for core interactive elements like buttons and badges, signifying growth and the faculty's agricultural focus.
- Dark Navigation Green: '#1B5E20', a deep green providing a stable base for headers and the sticky navigation, offering high contrast for text.
- Light UI Green: '#4CAF50', applied to hover states and secondary interactive elements, lending a fresh and accessible feel to the interface.
- Pale Background Green: '#F1F8E9', serves as the main background for content areas and cards, a highly desaturated variant of green to provide a calming and unobtrusive canvas.
- Accent Gold: '#F9A825', a vibrant amber gold for key highlights and Calls to Action (CTAs), representing excellence and attracting attention.
- Subtle Accent Gold: '#FFF8E1', a pale gold for lighter accents and tag backgrounds, creating visual hierarchy without overpowering.
- Semantic Colors: Text Dark ('#1A1A1A'), Text Mid ('#424242'), Text Muted ('#757575') for various text emphasis. Purple ('#5E35B1') for protected zone indicators, Blue ('#0277BD') for info and links, Orange ('#E65100') for news/appreciation, and Teal ('#00695C') for forum-specific elements.
- The font stack is 'Segoe UI', system-ui, sans-serif, ensuring a clean and consistent appearance across platforms.
- Headings are set in bold with tight tracking to ensure readability and impact, guiding user attention to key sections.
- Body text features a relaxed line-height and is sized at 14px–15px for optimal legibility during prolonged reading.
- Visual elements should consist of Unicode emoji or simple inline SVG graphics, avoiding external icon library dependencies to maintain a lean prototype.
- Content is constrained within a `max-w-6xl mx-auto px-4` container for consistent readability and a professional appearance.
- Card components utilize a `white bg, rounded-xl, shadow-sm, border border-gray-100` pattern, providing a clean, organized presentation for discrete content blocks.
- A sticky top navigation bar ensures constant access to main menu items, while a dedicated content area occupies the full height below.
- Detail views, like articles or profiles, open as centered modals with a dark overlay backdrop, and their content should allow scrolling if extensive.
- Interactive elements incorporate subtle hover states (e.g., `hover:shadow-md transition-shadow duration-200`) for visual feedback.
- Toast notifications appear at the bottom-right and auto-dismiss after 3 seconds, providing non-intrusive user feedback.
- A success animation, like a green checkmark pulse, is displayed upon the successful submission of the Tracer Study form.