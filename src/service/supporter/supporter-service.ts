import { getSupporter } from "../../db/supporter/query/supporter.js";

class SupporterService {
  static async getSupporter(email: string) {
    return getSupporter(email);
  }
}
