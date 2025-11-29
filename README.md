# Smart Task Analyzer

The Smart Task Analyzer is a full-stack web application designed to help users manage their tasks intelligently. It goes beyond a simple to-do list by incorporating a sophisticated priority scoring system, task dependency visualization, and the classic Eisenhower Matrix for task categorization. This allows users to focus on what truly matters, identify potential bottlenecks, and make informed decisions about their workload.

The project is built with a React frontend and a Django backend.

## Features

*   **Smart Priority Scoring**: Tasks are automatically assigned a `priorityScore` and a `smartPriorityScore` to help you identify what to work on next.
*   **Task Dependency Graph**: Visualize the relationships between your tasks in an interactive graph, making it easy to see prerequisites and plan your work.
*   **Circular Dependency Detection**: The system automatically identifies and flags circular dependencies, which can block progress.
*   **Eisenhower Matrix**: A drag-and-drop interface to categorize tasks into four quadrants: Do, Plan, Delegate, and Eliminate, based on urgency and importance.
*   **CRUD Functionality**: Full capabilities to create, read, update, and delete tasks.

## Setup Instructions

To get the Smart Task Analyzer running on your local machine, follow these steps for both the backend and frontend.

### Backend (Django)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    (Assuming you have a `requirements.txt` file in the `backend` directory)
    ```bash
    pip install -r requirements.txt
    ```
    If you don't have one, you'll need to install Django, Django REST Framework, and other packages.

4.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory and add the following, replacing the placeholder values with your actual credentials. These are used for email and SMS notifications.
    ```
    EMAIL_HOST_USER=your-email@gmail.com
    EMAIL_HOST_PASSWORD=your-email-password
    DEFAULT_FROM_EMAIL=your-email@gmail.com
    TWILIO_ACCOUNT_SID=your_twilio_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token
    TWILIO_FROM_NUMBER=+1your_twilio_phone_number
    ```

5.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Start the development server:**
    ```bash
    python manage.py runserver
    ```
    The backend will be running at `http://127.0.0.1:8000`.

### Frontend (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be running at `http://localhost:5173`. You can now access the application in your browser.

## Algorithm Explanation: Priority Scoring

The core of the Smart Task Analyzer is its ability to intelligently prioritize tasks. This is achieved through two distinct scoring mechanisms: a `priorityScore` and a `smartPriorityScore`. Both scores are calculated on the backend whenever a task is created or updated, providing the user with a dynamic and context-aware to-do list.

### `priorityScore`

The `priorityScore` provides a baseline prioritization based on user-defined attributes. It is a weighted sum of three key factors: **Urgency**, **Importance**, and **Estimated Time**.

1.  **Urgency**: This is derived from the task's due date. The closer the due date, the higher the urgency score. A task due today will have a significantly higher urgency component than a task due next month. This ensures that time-sensitive tasks are brought to the user's attention.

2.  **Importance**: This is a direct value (from 1 to 10) set by the user when creating a task. It reflects the strategic value or impact of completing the task. A higher importance rating directly translates to a higher priority score.

3.  **Estimated Time**: The time required to complete a task also influences its priority. The algorithm is designed to slightly favor shorter tasks, embodying the "quick win" philosophy. Completing several small but important tasks can build momentum and clear the way for larger, more complex ones. However, the weight for this factor is lower than for urgency and importance to prevent critical, long-duration tasks from being perpetually ignored.

The final `priorityScore` is a normalized value, making it easy to compare any two tasks in the system directly.

### `smartPriorityScore`

The `smartPriorityScore` is where the "smart" in Smart Task Analyzer comes from. It builds upon the `priorityScore` by incorporating the task's position within the larger project ecosystem, specifically its dependencies. This score adjusts a task's priority based on how many other tasks depend on its completion.

The calculation begins with the base `priorityScore`. Then, the algorithm traverses the task dependency graph to identify all "downstream" tasks—that is, any task that directly or indirectly lists the current task as a prerequisite.

For each downstream task found, a portion of its own `priorityScore` is added to the `smartPriorityScore` of the current task. This creates a cascading effect: a task that is a blocker for many other high-priority tasks will see its own `smartPriorityScore` increase substantially. This brilliantly reflects its true strategic priority. Completing this single "blocker" task can unlock a significant amount of subsequent work, making it a highly efficient use of time.

This "dependency-aware" scoring ensures that the user's attention is drawn not just to tasks that are individually urgent or important, but to those that are critical for the overall project's momentum. It helps prevent bottlenecks before they happen and encourages a more strategic approach to task management.

## Design Decisions

*   **State Management**: Instead of a global state management library like Redux or Zustand, I opted for a combination of local component state (`useState`) and React hooks (`useCallback`, `useMemo`). For server state, I made direct API calls within components and managed the loading/error states manually.
    *   **Trade-off**: This approach simplifies the initial setup and reduces bundle size. It's very effective for pages where data is self-contained. The downside is that it can lead to prop-drilling or repeated data fetching if the same state is needed across many disconnected components. For this project's scale, it was a pragmatic choice to avoid over-engineering.

*   **Optimistic UI Updates**: In the Eisenhower Matrix, when a task is dragged to a new quadrant, the UI updates immediately, before the API call to the backend completes.
    *   **Trade-off**: This provides a very fast and responsive user experience. The user gets immediate feedback on their action. The risk is that if the network request fails, the UI state becomes inconsistent with the backend state. I mitigated this by implementing a catch block that reverts the change and shows an error toast, ensuring the user is aware of the failure.

*   **Backend Framework**: Django was chosen for the backend.
    *   **Trade-off**: Django's "batteries-included" philosophy, including its built-in ORM and admin panel, accelerates development significantly. It's robust and secure. However, it can be more monolithic and less flexible than microframeworks like Flask or FastAPI. For an application with clear data models and authentication needs, Django was an excellent fit.

## Time Breakdown

*   **Project Setup (Backend & Frontend):** ~3 hours
*   **Backend Development (API Endpoints, Models, Logic):** ~8 hours
*   **Frontend Development (Components, Pages, Routing):** ~12 hours
*   **Priority Scoring Algorithm (Backend Logic):** ~4 hours
*   **Eisenhower Matrix (Dnd-kit, Logic):** ~5 hours
*   **Task Graph & Circular Dependency (Logic & UI):** ~6 hours
*   **Styling and UI/UX Refinement:** ~4 hours
*   **Testing and Debugging:** ~5 hours
*   **Total:** ~47 hours

## Bonus Challenges Attempted

*   **Task Dependency Graph**: Implemented a page to visualize task dependencies as a network graph.
*   **Circular Dependency Detection**: The backend identifies tasks that form a dependency cycle, and the frontend displays them in a dedicated section on the dashboard to be resolved.
*   **Eisenhower Matrix**: Created a fully functional drag-and-drop Eisenhower Matrix for intuitive task categorization.

## Future Improvements

Given more time, I would focus on the following areas:

1.  **Real-time Collaboration**: Implement WebSockets to allow multiple users to see updates in real-time without needing to refresh the page.
2.  **Enhanced Notifications**: Integrate the email and Twilio services more deeply, allowing users to configure reminders for upcoming due dates or notifications when a prerequisite task is completed.
3.  **User Authentication & Authorization**: While the backend has an `Auth` app, the frontend implementation could be built out with login/register pages and protected routes to create a full multi-user experience.
4.  **Advanced Filtering and Search**: Add more powerful filtering options to the task dashboard, allowing users to search by title, description, or filter by date ranges and dependency count.
5.  **Recurring Tasks**: Add support for creating tasks that recur on a daily, weekly, or monthly basis.
6.  **Global State Management**: As the app grows, I would refactor to use a dedicated state management library like Zustand or Redux Toolkit (with RTK Query) to centralize server cache and reduce redundant API calls.




