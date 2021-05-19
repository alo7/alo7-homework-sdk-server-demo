// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import * as Axios from "axios";
import { NextApiResponse } from "next";
import { get } from "lodash";
import * as AxiosLogger from "axios-logger";

/**
 * @param res {NextApiResponse}
 */
export default async (req, res) => {
  const { classId } = req.query;
  const axios = Axios.create();
  axios.interceptors.request.use(AxiosLogger.requestLogger,AxiosLogger.errorLogger);
  axios.interceptors.response.use(AxiosLogger.responseLogger,AxiosLogger.errorLogger);
  try {
    // {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1dHlwIjoiT1BFTl9QTEFURk9STV9VU0VSIiwiYXVkIjoib3Blbi1hcGktZ2F0ZXdheSIsInN1YiI6ImM5MjYwMGRmLWY4MjYtNDJlNi04MzdhLTFkMGViYWY5NjVlYiIsInNjaG9vbElkIjoiNDM4MDE1IiwiaXNzIjoiYWxvNy5jb20iLCJleHAiOjE2MjEzMTYzNDIsImp0aSI6ImYxMGI4YTA0LWQ0MzUtNDdiYS04ZjY4LTFhMjcxODY0MWNhZSJ9.O4-hY8IbLoTxwJgNue2GzGN3YiGiX7B6CMJhw_MvruB9tEMTUOCgS4m9SWHVEm1QKqoRRzQWtau9Z7Xn05tJ67X6LtQXOtjf3hu-UPHim97-oFxWIJZUXqlIroIj_cMXuYSz3cWe__5GUUan5ygzTcTDVJGrqt5duW9h8VGa0Hg","expiresIn":86400,"errCode":null,"errMsg":null}
    const {
      data: { token },
    } = await axios.get(
      `${process.env.GATE_WAY_API}/system/token?app_id=${process.env.APP_ID}&app_secret=${process.env.APP_SECRET}`
    );

    const result = await Promise.all([
      axios.get(
        `${process.env.GATE_WAY_API}/study-center/api/v5/thirdPartyClazz/${classId}/students`,
        { headers: { "X-ALO7-JWT": token } }
      ),
      axios.get(
        `${process.env.GATE_WAY_API}/study-center/api/v5/thirdPartyClazz/${classId}/teachers`,
        { headers: { "X-ALO7-JWT": token } }
      ),
    ]);
    res.status(200).json([
      {
        student: result[0].data.map((i) => ({
          openId: i.openStudentId,
          //   englishName
          name: i.chineseName,
        })),
        teacher: result[1].data.map((i) => ({
          openId: i.openTeacherId,
          name: i.name,
        })),
        classId: classId,
        school: "438015",
      },
    ]);
  } catch (e) {
    // console.error(e);
    res.status(500).json({ json: e.toJSON(), errors: get(e, "response.data") });
  }
};
