import { get } from "lodash";
import * as Axios from "axios";
import * as AxiosLogger from "axios-logger";
export default async (req, res) => {
  const { uuid, token, role } = req.query;

  const axios = Axios.create();
  axios.interceptors.request.use(AxiosLogger.requestLogger,AxiosLogger.errorLogger);
  axios.interceptors.response.use(AxiosLogger.responseLogger,AxiosLogger.errorLogger);
  try {
    if (role === "teacher") {
      const {
        data: {
          meta: { url: data },
        },
      } = await axios.get(
        `${process.env.TEACHER_API}/api/v1/h5url/homeworks/${uuid}/whole_result`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      res.redirect(data, 200);
    } else {
      const {
        data: {
          meta: { url: data },
        },
      } = await axios.get(
        `${process.env.STUDENT_API}/api/v2/homeworks/${uuid}/homework_h5url`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      res.redirect(data, 200);
    }
  } catch (e) {
    // console.error(e);
    res.status(500).json({ json: e.toJSON(), errors: get(e, "response.data") });
  }
};
