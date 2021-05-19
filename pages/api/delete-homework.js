import * as Axios from "axios";
import { get } from "lodash";
import * as AxiosLogger from "axios-logger";

export default async (req, res) => {
  const { homeworkId, token } = req.query;
  const axios = Axios.create();
  axios.interceptors.request.use(AxiosLogger.requestLogger,AxiosLogger.errorLogger);
  axios.interceptors.response.use(AxiosLogger.responseLogger,AxiosLogger.errorLogger);
  try {
    const data = await axios.delete(
      `${process.env.GATE_WAY_API}/study-center/api/v4/homework/${homeworkId}`,
      {
        headers: {
          // "X-ALO7-SCHOOL-ID": schoolId,
          "X-ALO7-JWT": token,
        },
      }
    );
    res.status(200).json({});
  } catch (e) {
    // console.error(e);
    res.status(500).json({ json: e.toJSON(), errors: get(e, "response.data") });
  }
};
