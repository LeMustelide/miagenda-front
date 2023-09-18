// schedule.model.ts

export interface ScheduleItem {
    title: string;
    date: string;
    end_time: string;
    groups: string[];
    location: string;
    professor: string;
    start_time: string;
}

export interface ScheduleData {
    data: ScheduleItem[];
    message: string;
    timestamp: string;
}
