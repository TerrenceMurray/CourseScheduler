package main

import (
	"fmt"
	"slices"

	"github.com/google/uuid"

	"github.com/TerrenceMurray/course-scheduler/internal/models"
	"github.com/TerrenceMurray/course-scheduler/internal/scheduler"
	"github.com/TerrenceMurray/course-scheduler/internal/scheduler/greedy"
	"github.com/TerrenceMurray/course-scheduler/internal/scheduler/greedy/weight"
)

func ptr[T any](v T) *T { return &v }

func main() {
	rooms := []*models.Room{
		models.NewRoom(uuid.New(), "FST 113", "lecture_room", uuid.New(), 150, nil, nil),
		models.NewRoom(uuid.New(), "CLT 201", "computer_lab", uuid.New(), 30, nil, nil),
		models.NewRoom(uuid.New(), "CHM 105", "chemistry_lab", uuid.New(), 25, nil, nil),
		models.NewRoom(uuid.New(), "ENG 302", "tutorial_room", uuid.New(), 40, nil, nil),
		models.NewRoom(uuid.New(), "LIB 001", "lecture_room", uuid.New(), 200, nil, nil),
		models.NewRoom(uuid.New(), "SCI 201", "lecture_room", uuid.New(), 120, nil, nil),
		models.NewRoom(uuid.New(), "CLT 305", "computer_lab", uuid.New(), 35, nil, nil),
		models.NewRoom(uuid.New(), "BIO 102", "biology_lab", uuid.New(), 24, nil, nil),
		models.NewRoom(uuid.New(), "HUM 405", "tutorial_room", uuid.New(), 35, nil, nil),
	}

	courses := []*models.Course{
		models.NewCourse(uuid.New(), "Introduction to Computer Science", nil, nil),
		models.NewCourse(uuid.New(), "Organic Chemistry", nil, nil),
		models.NewCourse(uuid.New(), "Calculus I", nil, nil),
		models.NewCourse(uuid.New(), "Data Structures", nil, nil),
		models.NewCourse(uuid.New(), "Physics 101", nil, nil),
		models.NewCourse(uuid.New(), "Biology 101", nil, nil),
		models.NewCourse(uuid.New(), "English Literature", nil, nil),
		models.NewCourse(uuid.New(), "Linear Algebra", nil, nil),
		models.NewCourse(uuid.New(), "Microeconomics", nil, nil),
		models.NewCourse(uuid.New(), "Introduction to Psychology", nil, nil),
		models.NewCourse(uuid.New(), "World History", nil, nil),
		models.NewCourse(uuid.New(), "Programming in Python", nil, nil),
	}

	sessions := []*models.CourseSession{
		// Introduction to Computer Science
		models.NewCourseSession(uuid.New(), courses[0].ID, "lecture_room", "lecture", ptr(int32(60)), ptr(int32(2)), nil, nil),
		models.NewCourseSession(uuid.New(), courses[0].ID, "computer_lab", "lab", ptr(int32(120)), ptr(int32(1)), nil, nil),
		// Organic Chemistry
		models.NewCourseSession(uuid.New(), courses[1].ID, "lecture_room", "lecture", ptr(int32(60)), ptr(int32(2)), nil, nil),
		models.NewCourseSession(uuid.New(), courses[1].ID, "chemistry_lab", "lab", ptr(int32(90)), ptr(int32(1)), nil, nil),
		// Calculus I
		models.NewCourseSession(uuid.New(), courses[2].ID, "lecture_room", "lecture", ptr(int32(90)), ptr(int32(3)), nil, nil),
		models.NewCourseSession(uuid.New(), courses[2].ID, "tutorial_room", "tutorial", ptr(int32(45)), ptr(int32(2)), nil, nil),
		// Data Structures
		models.NewCourseSession(uuid.New(), courses[3].ID, "lecture_room", "lecture", ptr(int32(60)), ptr(int32(2)), nil, nil),
		models.NewCourseSession(uuid.New(), courses[3].ID, "computer_lab", "lab", ptr(int32(120)), ptr(int32(1)), nil, nil),
		// Physics 101
		models.NewCourseSession(uuid.New(), courses[4].ID, "lecture_room", "lecture", ptr(int32(90)), ptr(int32(2)), nil, nil),
		// Biology 101
		models.NewCourseSession(uuid.New(), courses[5].ID, "lecture_room", "lecture", ptr(int32(60)), ptr(int32(3)), nil, nil),
		models.NewCourseSession(uuid.New(), courses[5].ID, "biology_lab", "lab", ptr(int32(120)), ptr(int32(1)), nil, nil),
		// English Literature
		models.NewCourseSession(uuid.New(), courses[6].ID, "lecture_room", "lecture", ptr(int32(75)), ptr(int32(2)), nil, nil),
		models.NewCourseSession(uuid.New(), courses[6].ID, "tutorial_room", "tutorial", ptr(int32(60)), ptr(int32(1)), nil, nil),
		// Linear Algebra
		models.NewCourseSession(uuid.New(), courses[7].ID, "lecture_room", "lecture", ptr(int32(90)), ptr(int32(2)), nil, nil),
		models.NewCourseSession(uuid.New(), courses[7].ID, "tutorial_room", "tutorial", ptr(int32(45)), ptr(int32(2)), nil, nil),
		// Microeconomics
		models.NewCourseSession(uuid.New(), courses[8].ID, "lecture_room", "lecture", ptr(int32(90)), ptr(int32(3)), nil, nil),
		// Introduction to Psychology
		models.NewCourseSession(uuid.New(), courses[9].ID, "lecture_room", "lecture", ptr(int32(60)), ptr(int32(2)), nil, nil),
		models.NewCourseSession(uuid.New(), courses[9].ID, "computer_lab", "lab", ptr(int32(90)), ptr(int32(1)), nil, nil),
		// World History
		models.NewCourseSession(uuid.New(), courses[10].ID, "lecture_room", "lecture", ptr(int32(75)), ptr(int32(2)), nil, nil),
		models.NewCourseSession(uuid.New(), courses[10].ID, "tutorial_room", "tutorial", ptr(int32(45)), ptr(int32(1)), nil, nil),
		// Programming in Python
		models.NewCourseSession(uuid.New(), courses[11].ID, "lecture_room", "lecture", ptr(int32(60)), ptr(int32(2)), nil, nil),
		models.NewCourseSession(uuid.New(), courses[11].ID, "computer_lab", "lab", ptr(int32(120)), ptr(int32(2)), nil, nil),
	}

	// Create scheduler with TotalTimeWeight strategy
	sched := greedy.NewGreedyScheduler(&weight.TotalTimeWeight{})

	// Configure scheduler
	config := &scheduler.Config{
		OperatingHours: scheduler.TimeRange{
			Start: 480,  // 8:00 AM
			End:   1260, // 9:00 PM
		},
		OperatingDays:           []scheduler.Day{scheduler.Monday, scheduler.Tuesday, scheduler.Wednesday, scheduler.Thursday, scheduler.Friday},
		MinBreakBetweenSessions: 10, // 10-minute break between sessions
		PreferredSlotDuration:   30, // Align to 30-minute slots
	}

	// Generate schedule
	output, err := sched.Generate(&scheduler.Input{
		Config:         config,
		Rooms:          rooms,
		Courses:        courses,
		CourseSessions: sessions,
	})
	if err != nil {
		fmt.Printf("Error generating schedule: %v\n", err)
		return
	}

	// Print results
	printCalendar(output.ScheduledSessions, courses, rooms)

	if len(output.Failures) > 0 {
		fmt.Println("\n⚠️  Failed to schedule:")
		for _, f := range output.Failures {
			course := findCourse(courses, f.CourseSession.CourseID)
			fmt.Printf("  - %s (%s, %d min): %s\n", course.Name, f.CourseSession.Type, *f.CourseSession.Duration, f.Reason)
		}
	}

	fmt.Printf("\nScheduler config:\n")
	fmt.Printf("  Operating hours: %s - %s\n", minsToTime(config.OperatingHours.Start), minsToTime(config.OperatingHours.End))
	fmt.Printf("  Min break between sessions: %d min\n", config.MinBreakBetweenSessions)
	fmt.Printf("  Preferred slot duration: %d min\n", config.PreferredSlotDuration)
}

func findCourse(courses []*models.Course, id uuid.UUID) *models.Course {
	for _, c := range courses {
		if c.ID == id {
			return c
		}
	}
	return nil
}

func findRoom(rooms []*models.Room, id uuid.UUID) *models.Room {
	for _, r := range rooms {
		if r.ID == id {
			return r
		}
	}
	return nil
}

func printCalendar(scheduled []*models.ScheduledSession, courses []*models.Course, rooms []*models.Room) {
	days := []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"}

	fmt.Println("\n" + repeatStr("═", 91))
	fmt.Println("  WEEKLY SCHEDULE")
	fmt.Println(repeatStr("═", 91))

	for dayIdx, dayName := range days {
		daySessions := []*models.ScheduledSession{}
		for _, s := range scheduled {
			if s.Day == dayIdx {
				daySessions = append(daySessions, s)
			}
		}

		// Sort by start time
		slices.SortFunc(daySessions, func(a, b *models.ScheduledSession) int {
			return a.StartTime - b.StartTime
		})

		fmt.Printf("\n📅 %s\n", dayName)
		fmt.Println(repeatStr("-", 50))

		if len(daySessions) == 0 {
			fmt.Println("   (no sessions)")
		} else {
			for _, s := range daySessions {
				course := findCourse(courses, s.CourseID)
				room := findRoom(rooms, s.RoomID)
				courseName := "Unknown"
				roomName := "Unknown"
				if course != nil {
					courseName = course.Name
				}
				if room != nil {
					roomName = room.Name
				}
				fmt.Printf("   %s - %s  │  %-30s  │  %s\n",
					minsToTime(s.StartTime), minsToTime(s.EndTime), courseName, roomName)
			}
		}
	}

	fmt.Println("\n" + repeatStr("═", 91))
	fmt.Printf("Total sessions scheduled: %d\n", len(scheduled))
}

func repeatStr(s string, n int) string {
	result := ""
	for range n {
		result += s
	}
	return result
}

func minsToTime(mins int) string {
	return fmt.Sprintf("%02d:%02d", mins/60, mins%60)
}
