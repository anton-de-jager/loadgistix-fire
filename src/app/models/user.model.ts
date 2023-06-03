import { load } from "./load.model";
import { status } from "./status.model";
import { advert } from "./advert.model";
import { tms } from "./tms.model";
import { bid } from "./bid.model";
import { directory } from "./directory.model";
import { driver } from "./driver.model";
//import { message } from "./message.model";
import { reviewDriver } from "./reviewDriver.model";
import { reviewLoad } from "./reviewLoad.model";
//import { userPermission } from "./userPermission.model";
import { vehicle } from "./vehicle.model";
import { message } from "./message.model";
import { subscription } from "./subscription.model";
import { userPermission } from "./userPermission.model";

export class user {
    id?: string;
	company?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	password?: string;
	phone?: string;
	tokenExpiry?: Date | null;
	accessToken?: string;
    status?: string;
	avatar?: string;
	reset?: string | null;

	advert?: advert[];
	bid?: bid[];
	directory?: directory[];
	driver?: driver[];
	load?: load[];
	message?: message[];
	reviewDriver?: reviewDriver[];
	reviewLoad?: reviewLoad[];
	subscription?: subscription[];
	userPermission?: userPermission[];
	vehicle?: vehicle[];
}