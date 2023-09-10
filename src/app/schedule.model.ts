// schedule.model.ts

export interface ScheduleItem {
    date: string;
    end_time: string;
    groups: string[];
    location: string;
    professor: string;
    start_time: string;
    title: string;
}

export interface ScheduleData {
    data: ScheduleItem[];
    message: string;
    timestamp: string;
}
