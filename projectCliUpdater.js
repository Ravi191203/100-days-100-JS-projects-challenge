const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const AVAILABLE_TECHNOLOGIES = [
    'HTML', 'CSS', 'JavaScript', 'API', 'React', 
    'Node.js', 'Python', 'Database', 'Vue', 'Bootstrap'
];

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

function clearTerminal() {
    console.clear();
}

function displayMainMenu() {
    console.log(`
${colors.cyan}================================
🚀 100 Days of JavaScript Projects
   Project Management CLI
================================${colors.reset}

Please select an option:

1. Create new project
2. Update existing project
3. Delete project
4. List all projects
5. Exit

`);
}

async function getMainMenuChoice() {
    while (true) {
        const choice = await question(`${colors.bright}Enter your choice (1-5): ${colors.reset}`);
        if (['1', '2', '3', '4', '5'].includes(choice)) {
            return parseInt(choice);
        }
        console.log(`${colors.yellow}⚠ Please enter a valid option (1-5)${colors.reset}`);
    }
}

async function validateDayNumber(day) {
    const num = parseInt(day);
    return num > 0 && num <= 100;
}

async function listAllProjects() {
    try {
        const indexContent = await fs.readFile('index.html', 'utf8');
        const projectCards = indexContent.match(/<div class="project-card">([\s\S]*?)<\/div>\s*<\/div>\s*<\/a>/g);

        if (!projectCards) {
            console.log(`${colors.yellow}No projects found.${colors.reset}`);
            return [];
        }

        const projects = projectCards.map(card => {
            const dayMatch = card.match(/Day (\d+)/);
            const titleMatch = card.match(/<div class="project-title">(.*?)<\/div>/);
            return {
                day: dayMatch ? dayMatch[1] : 'Unknown',
                title: titleMatch ? titleMatch[1] : 'Unknown'
            };
        });

        console.log('\nExisting Projects:');
        projects.forEach(project => {
            console.log(`${colors.cyan}Day ${project.day}${colors.reset}: ${project.title}`);
        });

        return projects;
    } catch (error) {
        console.error(`${colors.red}Error reading projects: ${error.message}${colors.reset}`);
        return [];
    }
}

async function deleteProject(dayNumber) {
    try {
        // Read the index.html file
        const indexPath = path.join(process.cwd(), 'index.html');
        let indexContent = await fs.readFile(indexPath, 'utf8');

        // Find and remove the project card
        const cardPattern = new RegExp(`<a href="Day${dayNumber.toString().padStart(2, '0')}/index.html"[\\s\\S]*?<\\/a>`);
        const newContent = indexContent.replace(cardPattern, '');

        if (newContent === indexContent) {
            console.log(`${colors.yellow}⚠ Project not found for Day ${dayNumber}${colors.reset}`);
            return false;
        }

        // Update the file
        await fs.writeFile(indexPath, newContent, 'utf8');

        // Try to remove the project directory
        const dirPath = path.join(process.cwd(), `Day${dayNumber.toString().padStart(2, '0')}`);
        await fs.rm(dirPath, { recursive: true, force: true });

        console.log(`${colors.green}✓ Successfully deleted project for Day ${dayNumber}${colors.reset}`);
        return true;
    } catch (error) {
        console.error(`${colors.red}Error deleting project: ${error.message}${colors.reset}`);
        return false;
    }
}

async function updateProject(dayNumber) {
    try {
        const projectData = await gatherProjectInfo(dayNumber, true);
        const newCard = generateProjectCard(projectData);

        // Read the index.html file
        const indexPath = path.join(process.cwd(), 'index.html');
        let indexContent = await fs.readFile(indexPath, 'utf8');

        // Find and replace the existing project card
        const cardPattern = new RegExp(`<a href="Day${dayNumber.toString().padStart(2, '0')}/index.html"[\\s\\S]*?<\\/a>`);
        const newContent = indexContent.replace(cardPattern, newCard);

        if (newContent === indexContent) {
            console.log(`${colors.yellow}⚠ Project not found for Day ${dayNumber}${colors.reset}`);
            return false;
        }

        // Update the file
        await fs.writeFile(indexPath, newContent, 'utf8');
        console.log(`${colors.green}✓ Successfully updated project for Day ${dayNumber}${colors.reset}`);
        return true;
    } catch (error) {
        console.error(`${colors.red}Error updating project: ${error.message}${colors.reset}`);
        return false;
    }
}

async function gatherProjectInfo(existingDay = null, isUpdate = false) {
    let projectData = {};

    // Get day number
    while (true) {
        if (existingDay) {
            projectData.dayNumber = parseInt(existingDay);
            break;
        }
        const dayNumber = await question(`${colors.bright}Enter project day number (1-100): ${colors.reset}`);
        if (await validateDayNumber(dayNumber)) {
            projectData.dayNumber = parseInt(dayNumber);
            break;
        }
        console.log(`${colors.yellow}⚠ Please enter a valid day number between 1 and 100${colors.reset}`);
    }

    projectData.title = await question(`${colors.bright}Enter project title: ${colors.reset}`);

    console.log('\nAvailable difficulty levels:');
    DIFFICULTY_LEVELS.forEach((level, index) => {
        console.log(`${index + 1}. ${level}`);
    });
    
    while (true) {
        const difficulty = await question(`${colors.bright}Select difficulty level (1-${DIFFICULTY_LEVELS.length}): ${colors.reset}`);
        const index = parseInt(difficulty) - 1;
        if (index >= 0 && index < DIFFICULTY_LEVELS.length) {
            projectData.difficulty = DIFFICULTY_LEVELS[index];
            break;
        }
        console.log(`${colors.yellow}⚠ Please enter a valid difficulty number${colors.reset}`);
    }

    projectData.description = await question(`${colors.bright}Enter project description: ${colors.reset}`);

    console.log('\nAvailable technologies:');
    AVAILABLE_TECHNOLOGIES.forEach((tech, index) => {
        console.log(`${index + 1}. ${tech}`);
    });
    
    projectData.technologies = [];
    while (true) {
        const tech = await question(`${colors.bright}Select technology number (or 'done' to finish): ${colors.reset}`);
        if (tech.toLowerCase() === 'done') {
            if (projectData.technologies.length > 0) break;
            console.log(`${colors.yellow}⚠ Please select at least one technology${colors.reset}`);
            continue;
        }
        
        const index = parseInt(tech) - 1;
        if (index >= 0 && index < AVAILABLE_TECHNOLOGIES.length) {
            const selected = AVAILABLE_TECHNOLOGIES[index];
            if (!projectData.technologies.includes(selected)) {
                projectData.technologies.push(selected);
                console.log(`${colors.green}✓ Added ${selected}${colors.reset}`);
            } else {
                console.log(`${colors.yellow}⚠ ${selected} already selected${colors.reset}`);
            }
        } else {
            console.log(`${colors.yellow}⚠ Please enter a valid technology number${colors.reset}`);
        }
    }

    projectData.status = 'completed';
    return projectData;
}

function generateProjectCard(project) {
    const techIcons = {
        'HTML': '<i class="fab fa-html5"></i> HTML',
        'CSS': '<i class="fab fa-css3"></i> CSS',
        'JavaScript': '<i class="fab fa-js"></i> JavaScript',
        'API': '<i class="fas fa-database"></i> API',
        'React': '<i class="fab fa-react"></i> React',
        'Node.js': '<i class="fab fa-node"></i> Node.js',
        'Python': '<i class="fab fa-python"></i> Python',
        'Database': '<i class="fas fa-database"></i> Database',
        'Vue': '<i class="fab fa-vuejs"></i> Vue',
        'Bootstrap': '<i class="fab fa-bootstrap"></i> Bootstrap'
    };

    const formattedDay = project.dayNumber.toString().padStart(2, '0');
    const techTags = project.technologies
        .map(tech => `<span class="meta-tag">${techIcons[tech] || tech}</span>`)
        .join('');

    return `
<a href="Day${formattedDay}/index.html" class="project-link">
    <div class="project-card">
        <div class="project-number">Day ${formattedDay}</div>
        <div class="project-title">${project.title}</div>
        <div class="project-meta">
            <span class="meta-tag difficulty" data-level="${project.difficulty}">
                <i class="fas fa-star"></i> ${project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
            </span>
            ${techTags}
        </div>
        <div class="project-description">
            ${project.description}
        </div>
        <div class="project-status">
            <div class="status-icon status-completed"></div>
            Completed
        </div>
    </div>
</a>`;
}

async function updateStats() {
    try {
        const indexPath = path.join(process.cwd(), 'index.html');
        let indexContent = await fs.readFile(indexPath, 'utf8');
        
        const projectCount = (indexContent.match(/<div class="project-card">/g) || []).length;
        
        const newStats = `
            <div class="stat-card">
                <div class="stat-value">${projectCount}</div>
                <div class="stat-label">Projects Complete</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${100 - projectCount}</div>
                <div class="stat-label">Days Remaining</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">4.5</div>
                <div class="stat-label">Avg. Difficulty</div>
            </div>`;

        indexContent = indexContent.replace(
            /<div class="stats-container">([\s\S]*?)<\/div>/,
            `<div class="stats-container">${newStats}</div>`
        );

        await fs.writeFile(indexPath, indexContent, 'utf8');
    } catch (error) {
        console.error(`${colors.yellow}Error updating stats: ${error.message}${colors.reset}`);
    }
}

async function createNewProject() {
    try {
        const projectData = await gatherProjectInfo();
        await createProjectDirectory(projectData.dayNumber);

        const indexPath = path.join(process.cwd(), 'index.html');
        let indexContent = await fs.readFile(indexPath, 'utf8');

        const newCard = generateProjectCard(projectData);
        indexContent = indexContent.replace(
            /<!-- Template for upcoming projects -->/,
            `${newCard}\n    <!-- Template for upcoming projects -->`
        );

        await fs.writeFile(indexPath, indexContent, 'utf8');
        await updateStats();

        console.log(`\n${colors.green}✓ Successfully created new project!${colors.reset}`);
        console.log(`${colors.cyan}→ New project directory: Day${projectData.dayNumber.toString().padStart(2, '0')}${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}Error creating project: ${error.message}${colors.reset}`);
    }
}

async function createProjectDirectory(dayNumber) {
    const dirName = `Day${dayNumber.toString().padStart(2, '0')}`;
    try {
        await fs.mkdir(dirName);
        console.log(`${colors.green}✓ Created directory: ${dirName}${colors.reset}`);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
}

async function main() {
    try {
        while (true) {
            clearTerminal();
            displayMainMenu();
            const choice = await getMainMenuChoice();

            switch (choice) {
                case 1: // Create new project
                    await createNewProject();
                    break;
                case 2: // Update existing project
                    await listAllProjects();
                    const updateDay = await question(`\n${colors.bright}Enter the day number to update (or 'cancel'): ${colors.reset}`);
                    if (updateDay.toLowerCase() !== 'cancel') {
                        await updateProject(parseInt(updateDay));
                        await updateStats();
                    }
                    break;
                case 3: // Delete project
                    await listAllProjects();
                    const deleteDay = await question(`\n${colors.bright}Enter the day number to delete (or 'cancel'): ${colors.reset}`);
                    if (deleteDay.toLowerCase() !== 'cancel') {
                        await deleteProject(parseInt(deleteDay));
                        await updateStats();
                    }
                    break;
                case 4: // List all projects
                    await listAllProjects();
                    await question(`\n${colors.bright}Press Enter to continue...${colors.reset}`);
                    break;
                case 5: // Exit
                    console.log(`${colors.green}Thanks for using the Project Management CLI!${colors.reset}`);
                    rl.close();
                    return;
            }

            if (choice !== 5) {
                await question(`\n${colors.bright}Press Enter to return to main menu...${colors.reset}`);
            }
        }
    } catch (error) {
        console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
        rl.close();
    }
}

main();