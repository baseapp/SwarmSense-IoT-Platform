"""
Conversion functions for fossils
"""

from collections import defaultdict

import pytz

from indico.modules.rb.models.reservation_occurrences import ReservationOccurrence


class Conversion(object):

    @classmethod
    def datetime(cls, dt, tz=None, convert=False):
        if dt:
            if tz:
                if isinstance(tz, basestring):
                    tz = pytz.timezone(tz)
                date = dt.astimezone(tz)
            else:
                date = dt
            if convert:
                return {'date': str(date.date()), 'time': str(date.time()), 'tz': str(date.tzinfo)}
            else:
                return date
        else:
            return None

    @classmethod
    def naive(cls, dt, tz=None, naiveTZ=None):
        if dt:
            if tz:
                if isinstance(tz, basestring):
                    tz = pytz.timezone(tz)

                if isinstance(naiveTZ, basestring):
                    naiveTZ = pytz.timezone(naiveTZ)

                date = naiveTZ.localize(dt).astimezone(tz)
            else:
                date = dt
            return date
        else:
            return None

    @classmethod
    def duration(cls, duration, units='minutes', truncate=True):
        if duration:
            from indico.legacy.common.utils import formatDuration
            return formatDuration(duration, units, truncate)
        else:
            return None

    @classmethod
    def reservationsList(cls, resvs):
        res = defaultdict(list)
        for resv in resvs:
            occurrences = (resv.occurrences
                           .filter(ReservationOccurrence.is_valid)
                           .options(ReservationOccurrence.NO_RESERVATION_USER_STRATEGY))
            res[resv.room.full_name] += [{'startDateTime': cls.datetime(occ.start_dt),
                                          'endDateTime': cls.datetime(occ.end_dt)}
                                         for occ in occurrences]
        return res

    @classmethod
    def iterable(cls, conversion):
        def iter(iteList):
            res = []
            for i in iteList:
                res.append(conversion(i))
            return res
        return iter

    @classmethod
    def url(cls, handler):
        def _url(locator):
            return str(handler.getURL(**locator))
        return _url
