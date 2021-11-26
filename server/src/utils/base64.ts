export const encode = (data: any) => {
  if (data) {
    const jsonStr = JSON.stringify(data);
    const buffer = Buffer.from(jsonStr);
    return buffer.toString('base64');
  }

  return null;
};

export const decode = (data: string) => {
  if (data) {
    const buffer = Buffer.from(data, 'base64');
    const str = buffer.toString('ascii');
    return JSON.parse(str);
  }

  return {};
};
